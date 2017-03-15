var parse = require('url').parse,
    events = require('events');

/**
 * Creates a new EventSource object
 *
 * @param {String} url the URL to which to connect
 * @param {Object} [eventSourceInitDict] extra init params. See README for details.
 * @api public
 **/
class EventSource extends events.EventEmitter {
    constructor(url, eventSourceInitDict) {
        super();
        this.url = url;
        this._readyState = EventSource.CONNECTING;
        this.reconnectInterval = 1000;

        this.lastEventId = '';

        if (eventSourceInitDict && eventSourceInitDict.headers && isPlainObject(eventSourceInitDict.headers) && eventSourceInitDict.headers['Last-Event-ID']) {
            this.lastEventId = eventSourceInitDict.headers['Last-Event-ID'];
            delete eventSourceInitDict.headers['Last-Event-ID'];
        }

        this.eventSourceInitDict = eventSourceInitDict;
        this.discardTrailingNewline = false;
        this.data = '';
        this.eventName = '';
        this.reconnectUrl = null;
        this.reader = null;
        this.connect();
    }

    get readyState() {
        return this._readyState;
    }

    onConnectionClosed = (e) => {
        if (this._readyState === EventSource.CLOSED) return;
        this._readyState = EventSource.CONNECTING;
        this._emit('error', new Event('error', e));

        // The url may have been changed by a temporary
        // redirect. If that's the case, revert it now.
        if (this.reconnectUrl) {
            this.url = this.reconnectUrl;
            this.reconnectUrl = null;
        }
        setTimeout(() => {
            if (this._readyState !== EventSource.CONNECTING) {
                return;
            }
            this.connect();
        }, this.reconnectInterval);
    }

    connect() {
        var eventSourceInitDict = this.eventSourceInitDict;
        var options = parse(this.url);
        var isSecure = options.protocol == 'https:';
        options.headers = { 'Cache-Control': 'no-cache', 'Accept': 'text/event-stream' };
        if (this.lastEventId) options.headers['Last-Event-ID'] = this.lastEventId;
        if (eventSourceInitDict && eventSourceInitDict.headers && isPlainObject(eventSourceInitDict.headers)) {
            for (var i in eventSourceInitDict.headers) {
                var header = eventSourceInitDict.headers[i];
                if (header) {
                    options.headers[i] = header;
                }
            }
        }

        options.rejectUnauthorized = !(eventSourceInitDict && eventSourceInitDict.rejectUnauthorized == false);

        // If specify http proxy, make the request to sent to the proxy server,
        // and include the original url in path and Host headers
        if (eventSourceInitDict && eventSourceInitDict.proxy) {
            var proxy = parse(eventSourceInitDict.proxy);
            options.path = this.url;
            options.headers.Host = options.host;
            options.hostname = proxy.hostname;
            options.host = proxy.host;
            options.port = proxy.port;
        }

        console.log(`fetching ${this.url}...`);
        fetch(this.url, toFetchOptions(options)).then(res => {
            console.log(res.status, res.statusText);
            // Handle HTTP redirects
            if (res.status == 301 || res.status == 307) {
                if (!res.headers.get('Location')) {
                    // Server sent redirect response without Location header.
                    this._emit('error', new Event('error', { status: res.status }));
                    return;
                }
                if (res.status == 307) this.reconnectUrl = this.url;
                this.url = res.headers.get('Location');
                process.nextTick(this.connect);
                return;
            }
            if (res.status !== 200) {
                this._emit('error', new Event('error', { status: res.status }));
                if (res.status == 204) return this.close();
                return;
            }

            var reader = this.reader = res.body().getReader();
            var decoder = new TextDecoder();

            var buf = '';
            var self = this;
            this._readyState = EventSource.OPEN;
            return reader.read().then(function handleNext(result) {
                console.log("reader.read()", result.done);
                if (self._readyState == EventSource.CLOSED) return;
                if (result.done) {
                    self.onConnectionClosed();
                    return;
                }

                buf += decoder.decode(result.value || new Uint8Array, {
                    stream: !result.done
                });

                var pos = 0
                    , length = buf.length;
                while (pos < length) {
                    if (discardTrailingNewline) {
                        if (buf[pos] === '\n') {
                            ++pos;
                        }
                        discardTrailingNewline = false;
                    }

                    var lineLength = -1
                        , fieldLength = -1
                        , c;

                    for (var i = pos; lineLength < 0 && i < length; ++i) {
                        c = buf[i];
                        if (c === ':') {
                            if (fieldLength < 0) {
                                fieldLength = i - pos;
                            }
                        } else if (c === '\r') {
                            discardTrailingNewline = true;
                            lineLength = i - pos;
                        } else if (c === '\n') {
                            lineLength = i - pos;
                        }
                    }

                    if (lineLength < 0) {
                        break;
                    }

                    self.parseEventStreamLine(buf, pos, fieldLength, lineLength);

                    pos += lineLength + 1;
                }

                if (pos === length) {
                    buf = '';
                } else if (pos > 0) {
                    buf = buf.slice(pos);
                }

                return reader.read().then(handleNext);
            });
        })
        .then(r => {
            console.log('fetch().then()');
            this.onConnectionClosed();
        })
        .catch(e => {
            console.log('fetch().error()', e);
            this.onConnectionClosed(e);
        });
        // if (req.setNoDelay) req.setNoDelay(true);
    }

    _emit() {
        if (this.listeners(arguments[0]).length > 0) {
            this.emit.apply(this, arguments);
        }
    }

    close() {
        if (this._readyState == EventSource.CLOSED) return;
        this._readyState = EventSource.CLOSED;
        if (this.reader) this.reader.cancel();
    }

    parseEventStreamLine(buf, pos, fieldLength, lineLength) {
        if (lineLength === 0) {
            if (this.data.length > 0) {
                var type = eventName || 'message';
                this._emit(type, new MessageEvent(type, {
                    data: this.data.slice(0, -1), // remove trailing newline
                    lastEventId: this.lastEventId,
                    origin: origin(this.url)
                }));
                this.data = '';
            }
            this.eventName = void 0;
        } else if (fieldLength > 0) {
            var noValue = fieldLength < 0
                , step = 0
                , field = buf.slice(pos, pos + (noValue ? lineLength : fieldLength));

            if (noValue) {
                step = lineLength;
            } else if (buf[pos + fieldLength + 1] !== ' ') {
                step = fieldLength + 1;
            } else {
                step = fieldLength + 2;
            }
            pos += step;
            var valueLength = lineLength - step
                , value = buf.slice(pos, pos + valueLength);

            if (field === 'data') {
                this.data += value + '\n';
            } else if (field === 'event') {
                this.eventName = value;
            } else if (field === 'id') {
                this.lastEventId = value;
            } else if (field === 'retry') {
                var retry = parseInt(value, 10);
                if (!Number.isNaN(retry)) {
                    this.reconnectInterval = retry;
                }
            }
        }
    }
}

['open', 'error', 'message'].forEach(function (method) {
    Object.defineProperty(EventSource.prototype, 'on' + method, {
        /**
         * Returns the current listener
         *
         * @return {Mixed} the set function or undefined
         * @api private
         */
        get: function get() {
            var listener = this.listeners(method)[0];
            return listener ? (listener._listener ? listener._listener : listener) : undefined;
        },

        /**
         * Start listening for events
         *
         * @param {Function} listener the listener
         * @return {Mixed} the set function or undefined
         * @api private
         */
        set: function set(listener) {
            this.removeAllListeners(method);
            this.addEventListener(method, listener);
        }
    });
});

/**
 * Ready states
 */
Object.defineProperty(EventSource, 'CONNECTING', { enumerable: true, value: 0 });
Object.defineProperty(EventSource, 'OPEN', { enumerable: true, value: 1 });
Object.defineProperty(EventSource, 'CLOSED', { enumerable: true, value: 2 });

/**
 * Emulates the W3C Browser based WebSocket interface using addEventListener.
 *
 * @param {String} method Listen for an event
 * @param {Function} listener callback
 * @see https://developer.mozilla.org/en/DOM/element.addEventListener
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
EventSource.prototype.addEventListener = function addEventListener(method, listener) {
    if (typeof listener === 'function') {
        // store a reference so we can return the original function again
        listener._listener = listener;
        this.on(method, listener);
    }
};

/**
 * W3C Event
 *
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-Event
 * @api private
 */
function Event(type, optionalProperties) {
    Object.defineProperty(this, 'type', { writable: false, value: type, enumerable: true });
    if (optionalProperties) {
        for (var f in optionalProperties) {
            if (optionalProperties.hasOwnProperty(f)) {
                Object.defineProperty(this, f, { writable: false, value: optionalProperties[f], enumerable: true });
            }
        }
    }
}

/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/webmessaging/#event-definitions
 * @api private
 */
function MessageEvent(type, eventInitDict) {
    Object.defineProperty(this, 'type', { writable: false, value: type, enumerable: true });
    for (var f in eventInitDict) {
        if (eventInitDict.hasOwnProperty(f)) {
            Object.defineProperty(this, f, { writable: false, value: eventInitDict[f], enumerable: true });
        }
    }
}

function origin(url) {
    if ('string' === typeof url) url = parse(url);
    if (!url.protocol || !url.hostname) return 'null';
    return (url.protocol + '//' + url.host).toLowerCase();
}
origin.same = function same(a, b) {
    return origin(a) === origin(b);
};
function isPlainObject(obj) {
    return Object.getPrototypeOf(obj) === Object.prototype;
}

function toFetchOptions(options) {
    var headers = new Headers();
    Object.keys(options.headers).forEach(k => {
        headers.set(k, options.headers[k]);
    });
    var to = Object.assign(options, {
        method: "GET",
        mode: 'cors',
        include: 'credentials',
        headers
    });
    return to;
}

module.exports = EventSource;