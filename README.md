# TypeScript Service Client and Server Events Apps

This project contains a number of self-contained TypeScript and JavaScript projects showcasing the different JavaScript runtime environments that can leverage 
[servicestack-client](https://github.com/ServiceStack/servicestack-client) 
to enable typed end-to-end API calls using the generic `JsonServiceClient` and the generated 
[TypeScript Add ServiceStack Reference](http://docs.servicestack.net/typescript-add-servicestack-reference) DTOs as well as easily handling real-time notifications using 
[TypeScript ServerEventsClient](http://docs.servicestack.net/typescript-server-events-client) 
with minimal effort.

The [servicestack-client](https://github.com/ServiceStack/servicestack-client) npm 
package contains an isomorphic library that can be used in either JavaScript or TypeScript Single Page Web Apps, node.js server projects as well as React Native Mobile Apps. It closely follows the design of the 
[C#/.NET JsonServiceClient](http://docs.servicestack.net/csharp-client) and C#
[ServerEventsClient](http://docs.servicestack.net/csharp-server-events-client) 
in idiomatic TypeScript to maximize **knowledge sharing** and minimize native **porting efforts** between the different languages [Add ServiceStack Reference supports](http://docs.servicestack.net/add-servicestack-reference#supported-languages).

The examples in this project below explore the simplicity, type benefits and value provided by the 
`JsonServiceClient` and `ServerEventsClient` which enables 100% code sharing of client logic across
JavaScript's most popular environments.

## Web App

The [Web Example App](https://github.com/ServiceStackApps/typescript-server-events/tree/master/web)
was built with in [>100 lines of application code](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/src/app.ts)
and uses no external runtime library dependencies other than 
[servicestack-client](https://github.com/ServiceStack/servicestack-client) for its functional Web App
that can connect to any ServerEvents-enabled ServiceStack instance (with CORS) to keep a real-time log of all
commands sent to the subscribed channel with a synchronized Live list of other Users that are also currently subscribed to the channel.

The Web App is spread across the 4 files below with all functionality maintained in **app.ts**:

 - [app.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/src/app.ts) - Entire App Logic
 - [dtos.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/src/dtos.ts) - Server generated DTOs from [chat.servicestack.net/types/typescript](http://chat.servicestack.net/types/typescript)
 - [index.html](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/index.html) - Static HTML page
 - [default.css](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/default.css) - Static default.css styles

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/typescript-serverevents/web.png)

### Web Server Events Configuration

The heart of the App that's driving all its functionality is the Server Events subscription contained
in these few lines below:

```ts
const startListening = () => {
    BASEURL = $("#baseUrl").value;
    CHANNEL = $("#channel").value;
    if (client != null) 
        client.stop();

    console.log(`Connecting to ${BASEURL} on channel ${CHANNEL}`);
    client = new ServerEventsClient(BASEURL, [CHANNEL], {
        handlers: {
            onConnect: (e:ServerEventConnect) => {
                refresh(sub = e);
            },
            onJoin: refresh,
            onLeave: refresh,
            onUpdate: refresh,
            onMessage: (e:ServerEventMessage) => {
                addMessage(e);
                refreshMessages();
            }
        },
        onException: e => {
            addMessageHtml(`<div class="error">${e.message || e}</div>`);
        }
    }).start();
}
```

### Handler implementations

Essentially declarative configuration hooking up different Server Events to the `refresh` handlers 
below which adds the command message to the channels `MESSAGES` list, updates the UI then refreshes the
`users` list by calling the built-in `client.getChannelSubscribers()`:

```ts
const $ = sel => document.querySelector(sel);
const $msgs = $("#messages > div") as HTMLDivElement;
const $users = $("#users > div") as HTMLDivElement;

const refresh = (e:ServerEventMessage) => {
    addMessage(e); 
    refreshMessages();
    refreshUsers();
}; 

const refreshUsers = async () => {
    var users = await client.getChannelSubscribers();
    users.sort((x,y) => y.userId.localeCompare(x.userId));
    var usersMap = {};
    var userIds = Object.keys(usersMap);
    var html = users.map(x => 
        `<div class="${x.userId == sub.userId ? 'me' : ''}">
            <img src="${x.profileUrl}" /><b>@${x.displayName}</b><i>#${x.userId}</i><br/>
        </div>`);
    $users.innerHTML = html.join('');
};

const addMessage = (x:ServerEventMessage) => addMessageHtml(
    `<div><b>${x.selector}</b> 
        <span class="json" title=${x.json}>${x.json}</span>
    </div>`);
const addMessageHtml = (html) => (MESSAGES[CHANNEL] || (MESSAGES[CHANNEL]=[])).push(html);
const refreshMessages = () => $msgs.innerHTML= (MESSAGES[CHANNEL]||[]).reverse().join('');
```

### Changing Server Subscription

To change the server and channel we want to connect to we just need to `startListening()` again
when the **change** button is clicked:

```csharp
$("#btnChange").onclick = startListening;
```

Which will close the previous subscription and start a new one at the new server and channel. 
You can test connecting to another server by connecting to the .NET Core version of Chat at [chat.netcore.io](http://chat.netcore.io).

### Calling Typed Web Services

The Web App also sends messages 

Download the TypeScript DTOs from the [chat.servicestack.net](http://chat.servicestack.net) at 
[/types/typescript](http://docs.servicestack.net/add-servicestack-reference#language-paths)

    curl http://chat.servicestack.net/types/typescript > dtos.ts

Then once their downloaded we can reference the Request DTO's of the Services we want to call with:

```ts
import { PostChatToChannel, PostRawToChannel } from "./dtos";
```

Which just like all 
[ServiceStack Reference languages](http://docs.servicestack.net/add-servicestack-reference#supported-languages)
we can populate and send with a generic `JsonServiceClient`, an instance of which is also pre-configured with the same `{baseUrl}` available at `client.serviceClient`, e.g:

```ts
const sendChat = () => {
    let request = new PostChatToChannel();
    request.from = sub.id;
    request.channel = CHANNEL;    
    request.selector = "cmd.chat";
    request.message = $("#txtChat").value;
    client.serviceClient.post(request);
};
```

All that's left is sending the chat message which we can do by pressing the **chat** button or hitting enter:

```ts
$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = e => e.keyCode == 13 ? sendChat() : null;
```

### Running Web App

To see it in action we just need to launch a static Web Server in the `/web` directory, e.g:

    cd web
    http-server

Which will launch a HTTP Server at `http://localhost:8080/` which you can play with in your browser.

### Making changes to Web App

The vibrant ecosystem surrounding npm makes it the best place to develop Single Page Apps with world class
tools like [Babel](https://babeljs.io/) which you can run in a command-line with:

    npm run watch

That will launch a background watcher to monitor your source files for changes and **on save** automatically
pipe them through the TypeScript compiler and bundle your app in `/dist/bundle.js` which
is the only .js source file our app needs to reference and reload with **F5** to see any changes.

## node.js Server App

The [/node](https://github.com/ServiceStackApps/typescript-server-events/tree/master/node) server.js app
has exactly the same functionality as the Web App except instead of using **servicestack-client** to connect 
to [chat.servicestack.net](http://chat.servicestack.net) Server Events stream on the client, all
connections are made in node.js and only the server state is sent to the client to render its UI.

As the functionality of the app remains the same we're able to reuse the existing DTOs, .html and .css:

 - [dtos.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/src/dtos.ts)
 - [index.html](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/index.html)
 - [default.css](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/default.css)

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/typescript-serverevents/node.png)

The difference is in the App's logic which is now split into 2 with the node.js `server.ts` now containing 
most of the App's functionality whilst the `app.ts` relegated to periodically updating the UI with the
node.js server state:

 - [server.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/server.ts) - maintain all client and server events connection to [chat.servicestack.net](http://chat.servicestack.net)
 - [app.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/src/app.ts) - periodically render node.js state to HTML UI

As our goal is to maintain the minimal dependencies in each App, the implementation of `server.ts` is
written against a bare-bones node `http.createServer()` without utilizing a server web framework which 
makes the implementation more verbose but also easier to understand as we're not relying on any hidden 
functionality enabled in a server web framework.

### Enable Server Events

A change we need to make given our App is now running in node.js instead of in a browser is to import the 
[eventsource](https://www.npmjs.com/package/eventsource) pure JavaScript polyfill to provide an `EventSource` implementation in node.js which we can make available in the ``global`` scope in TypeScript with:

```ts
declare var global:any;
global.EventSource = require('eventsource');
```

### Node.js Server Events Configuration

Whilst the environment is different the Server Events configuration remains largely the same, but instead of 
retrieving the connection info from Text boxes in a Web Page, it's instead retrieved from the queryString
passed when the client App calls our `/listen` handler, e.g:

```ts
"/listen": (req,res) => {
    const qs = url.parse(req.url, true).query;
    if (client) {
        client.stop();
        client = null;
    }
    BASEURL = qs["baseUrl"];
    CHANNEL = qs["channel"];
    console.log(`Connecting to ${BASEURL} #${CHANNEL}...`);
    client = new ServerEventsClient(BASEURL, [CHANNEL], {
        handlers: {
            onConnect: (e:ServerEventConnect) => {
                refresh(sub = e);
            },
            onJoin: refresh,
            onLeave: refresh,
            onUpdate: refresh,
            onMessage: (e:ServerEventMessage) => {
                addMessage(e);
            }
        },
        onException: e => {
            addMessageHtml(`<div class="error">${e.message || e}</div>`);
        }
    }).start();
    res.end();
},
```

### Node.js Handler implementation

The handler implementations are more or less the same as the Web App albeit a bit simpler as it just needs
to capture the Server Event messages and not concern itself with updating the UI:

```ts
var MESSAGES = [];
var USERS = [];

const refresh = (e:ServerEventMessage) => {
    addMessage(e); 
    refreshUsers();
}; 
const refreshUsers = async () => {
    var users = await client.getChannelSubscribers();
    users.sort((x,y) => y.userId.localeCompare(x.userId));

    var usersMap = {};
    var userIds = Object.keys(usersMap);
    USERS = users.map(x => ({
        profileUrl: x.profileUrl,
        displayName: x.displayName,
        userId: x.userId
    }));
};
const addMessage = (x:ServerEventMessage) => 
    addMessageHtml(`<div><b>${x.selector}</b> <span class="json" title=${x.json}>${x.json}</span></div>`);
const addMessageHtml = (html:string) => 
    (MESSAGES[CHANNEL] || (MESSAGES[CHANNEL] = [])).push(html);
```

### Syncing the UI with Server state in node.js

Syncing and rendering the UI is now the primary job of our clients `app.ts` which just polls the servers
`/state` route every 100ms and injects it into the HTML UI:

```ts
const syncState = () => {
    client.get<any>("/state").then(state => {
        var html = state.users.map(x => 
            `<div class="${x.userId == state.sub.userId ? 'me' : ''}">
                <img src="${x.profileUrl}" /><b>@${x.displayName}</b><i>#${x.userId}</i><br/>
            </div>`);
        $users.innerHTML = html.join('');
        $msgs.innerHTML = state.messages.reverse().join('');
    });
};

setInterval(syncState, 100);
```

The `/state` handler being just dumping the state and collections to JSON:

```ts
"/state": (req, res) => {
    var state = {
        baseUrl: BASEURL,
        channel: CHANNEL,
        sub,
        messages: (MESSAGES[CHANNEL] || ['<div class="error">NOT CONNECTED</div>']),
        users: USERS
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(state));
},
```

### Calling Typed Web Services in node.js

As we can expect making Typed API calls in node.js is the same as in a browser except the user data
comes from a queryString instead of a HTML UI: 

```ts
"/chat": (req,res) => {
    const qs = url.parse(req.url, true).query;
    let request = new PostChatToChannel();
    request.from = sub.id;
    request.channel = CHANNEL;    
    request.selector = "cmd.chat";
    request.message = qs["message"];
    client.serviceClient.post(request);
    res.end();
},
```

Back in client `app.ts` land our event handlers are exactly the same, the difference is in `sendChat()` 
where instead of making the API call itself it tells the node `server.ts` to do it by calling the `/chat`
handler:

```ts
const sendChat = () => client.get("/chat", { message: $("#txtChat").value });

$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = e => e.keyCode == 13 ? sendChat() : null;
```

### Running node server.ts

To run our node app we need to launch the compiled `server.js` App with:

    cd node
    node server.js

Which also launches our HTTP Server at `http://localhost:8080/`.

### Making changes to Web App

Since there's now a client and server component, we still need to run **Babel** to monitor our source files
for changes and regenerate client `/dist/bundle.js`:

    npm run watch

But if we've a change to `server.ts` we need to compile it by running:

    tsc

Then we can re-run our server to see our changes:

    node server.js

## React Native App

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/typescript-serverevents/react-native.png)


