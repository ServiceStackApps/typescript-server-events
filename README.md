# TypeScript Service Client and Server Events Apps

This project contains a number of self-contained TypeScript and JavaScript projects showcasing the different JavaScript runtime environments that can leverage the isomorphic and multi-platform
[servicestack-client](https://github.com/ServiceStack/servicestack-client) library in Web and React Native 
Mobile Apps as well as node.js server and test projects to enable effortlesss typed end-to-end API calls using the generic `JsonServiceClient` and generated 
[TypeScript Add ServiceStack Reference](http://docs.servicestack.net/typescript-add-servicestack-reference) DTOs as well as easily handling real-time notifications using 
[TypeScript ServerEventsClient](http://docs.servicestack.net/typescript-server-events-client).

![](https://raw.githubusercontent.com/ServiceStack/Assets/ca79950600197dc7da1f3e1db7877fff427523f9/img/livedemos/typescript-serverevents/typescript-server-events.png)

The [servicestack-client](https://github.com/ServiceStack/servicestack-client) npm 
package can be used in either TypeScript or pure JavaScript projects and closely follows the design of the 
[C#/.NET JsonServiceClient](http://docs.servicestack.net/csharp-client) and C#
[ServerEventsClient](http://docs.servicestack.net/csharp-server-events-client) 
in idiomatic JavaScript to maximize **knowledge sharing** and minimize native **porting efforts** between the different languages and platforms [ServiceStack References supports](http://docs.servicestack.net/add-servicestack-reference#supported-languages).

The examples below explore the type benefits and value provided by the `JsonServiceClient` and `ServerEventsClient` which enables 100% code sharing of client logic across JavaScript's most popular environments.

## Web App

The [Web Example App](https://github.com/ServiceStackApps/typescript-server-events/tree/master/web)
built with less than [>100 lines of application code](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/src/app.ts) uses no external runtime library dependencies other than 
[servicestack-client](https://github.com/ServiceStack/servicestack-client) for its functional Web App
that can connect to any CORS and ServerEvents-enabled ServiceStack instance and keep a real-time log of all
messages sent to the subscribed channel whilst maintaining a synchronized Live list of Users currently subscribed to the same channel.

The Web App is made up of the 4 files below with all functionality maintained in **app.ts**:

 - [app.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/src/app.ts) - Entire App Logic
 - [dtos.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/src/dtos.ts) - Server generated DTOs from [chat.servicestack.net/types/typescript](http://chat.servicestack.net/types/typescript)
 - [index.html](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/index.html) - Static HTML page
 - [default.css](https://github.com/ServiceStackApps/typescript-server-events/blob/master/web/default.css) - Static default.css styles

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/typescript-serverevents/web.png)

### Web Server Events Configuration

The heart of the App that's driving all its functionality is the Server Events subscription below:

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

Essentially just declarative configuration hooking up different Server Events to the handlers below which 
adds any commands and messages to the channels `MESSAGES` list, updates the UI then refreshes the `users` list by calling the built-in `client.getChannelSubscribers()` API:

```ts
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
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

To change the server and channel we want to connect to we just call `startListening()` again
when the **change** button is clicked or **Enter** key is pressed:

```csharp
$("#btnChange").onclick = startListening;
$$("#baseUrl,#channel").forEach(x => x.onkeydown = e => e.keyCode == 13 ? startListening() : null);
```

Which will close the previous subscription and start a new one on the new server and channel. 
You can test connecting to another server by connecting to the .NET Core version of Chat at [chat.netcore.io](http://chat.netcore.io).

### Calling Typed Web Services

The Web App also makes Typed API Requests to send messages and commands to other users in the channels.

To make Typed API Requests we need to first download [chat.servicestack.net](http://chat.servicestack.net) TypeScript DTOs at [/types/typescript](http://docs.servicestack.net/add-servicestack-reference#language-paths):

    curl http://chat.servicestack.net/types/typescript > dtos.ts

Once downloaded we can import the Request DTO's of the Services we want to call:

```ts
import { PostChatToChannel, PostRawToChannel } from "./dtos";
```

Then just like all other supported
[ServiceStack Reference languages](http://docs.servicestack.net/add-servicestack-reference#supported-languages)
we just need to send a populated Request DTO using a generic `JsonServiceClient` - an instance of which is pre-configured with the same `{baseUrl}` at `client.serviceClient`:

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

Which is called each time the **chat** button is pressed or **Enter** key is pressed:

```ts
$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = e => e.keyCode == 13 ? sendChat() : null;
```

### Running Web App

To see our App in action we just need to launch a static Web Server in the `/web` directory which we 
can use the command-line [http-server](https://www.npmjs.com/package/http-server) to do by running:

    cd web
    http-server

To launch a HTTP Server at `http://localhost:8080/` which you can now play with in your browser.

### Making changes to Web App

The vibrant ecosystem surrounding npm makes it the best place to develop Single Page Apps with best-of-class
tools like [Babel](https://babeljs.io/) which you can run in the command-line with:

    npm run watch

This will launch a background watcher to monitor your source files for changes and **on save** automatically
pipe them through the TypeScript compiler and bundle its output in `/dist/bundle.js` which
is the only .js source file our app references, that we can reload with **F5** to see any changes.

## node.js Server App

The [/node](https://github.com/ServiceStackApps/typescript-server-events/tree/master/node) server.js app
has the same functionality as the Web App except instead of connecting to the [chat.servicestack.net](http://chat.servicestack.net) Events stream on the client, all connections are made in node.js and its 
only the server state that's sent to the client which uses it to render the UI.

As the functionality of the app remains the same we're able to reuse the existing DTOs, .html and .css 
from the Web App:

 - [dtos.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/src/dtos.ts)
 - [index.html](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/index.html)
 - [default.css](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/default.css)

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/typescript-serverevents/node.png)

The difference is in the App's logic which is now split into 2 files with the node.js `server.ts` now 
containing most of the App's functionality whilst the `app.ts` relegated to periodically updating the UI 
with the node.js server state:

 - [server.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/server.ts) - maintain all client and server events connection to [chat.servicestack.net](http://chat.servicestack.net)
 - [app.ts](https://github.com/ServiceStackApps/typescript-server-events/blob/master/node/src/app.ts) - periodically render node.js state to HTML UI

As our goal is to maintain the minimal dependencies in each App, the implementation of `server.ts` is
written against node.js's bare-bones `http.createServer()` directly without utilizing any external web 
framework which makes the implementation more verbose but also easier to understand as it's not relying 
on any hidden functionality contained in a 3rd Party server web framework.

### Enable Server Events in node.js

A change we need to make given our App is now running in node.js instead of a browser is to import the 
pure JavaScript [eventsource](https://www.npmjs.com/package/eventsource) polyfill to provide an `EventSource` implementation in node.js which we can import in the ``global`` scope in TypeScript with:

```ts
declare var global:any;
global.EventSource = require('eventsource');
```

### Node.js Server Events Configuration

Whilst the environment is different the Server Events configuration remains mostly the same, but instead of 
retrieving the connection info from Text boxes in a Web Page, it's instead retrieved from the queryString
passed when the client App calls the `/listen` handler, e.g:

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
to capture the Server Event messages without needing to concern itself with updating the UI:

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
`/state` every 100ms and inject it into the HTML UI:

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

The `/state` handler just dumps our internal node.js state and collections to JSON:

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

As we can expect, making Typed API calls in node.js is the same as in a browser except the user data
comes from a queryString instead of HTML Text INPUT fields: 

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

Back in our client `app.ts`, the event handlers remain exactly the same, the difference is in `sendChat()` implementation where instead of sending the Chat message itself, it tells the node `server.ts` to do it 
by calling the local `/chat` service:

```ts
const sendChat = () => client.get("/chat", { message: $("#txtChat").value });

$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = e => e.keyCode == 13 ? sendChat() : null;
```

### Running node server.ts

To run our node app we need to launch the compiled `server.js` App with:

    cd node
    node server.js

Which launches our node.js HTTP Server at `http://localhost:8080/`.

### Making changes to Web App

Since there's now a client and server component, we still need to run **Babel** to monitor our app.ts source 
file for changes to regenerate the App's `/dist/bundle.js`:

    npm run watch

But if we've made a change to `server.ts` we need to compile it by running:

    tsc

Then we can re-run our server to see our changes:

    node server.js

## React Native App

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/typescript-serverevents/react-native.png)


