import http = require("http");
import fs = require("fs");
import url = require("url");
declare var global:any;
global.EventSource = require('eventsource');

import { 
    ServerEventsClient,
    ServerEventConnect,
    ServerEventMessage, 
    ServerEventCommand,
    splitOnFirst, splitOnLast
} from "servicestack-client";
import { PostChatToChannel, PostRawToChannel } from "./src/dtos";

var client:ServerEventsClient = null;
var CHANNEL = "";
var BASEURL = "";
var sub:ServerEventConnect = null;
var MESSAGES = [];
var USERS = [];

const refresh = (e:ServerEventMessage) => {
    addMessage(e); 
    refreshUsers();
}; 
const refreshUsers = async () => {
    var users = await client.getChannelSubscribers();
    users.sort((x,y) => y.userId.localeCompare(x.userId));
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

const HANDLERS: { [index:string]: ((req:http.IncomingMessage, res:http.ServerResponse) => void) } = {
    "/": (req, res) => handleFile("/index.html", res),
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
    "/raw": (req,res) => {
        const qs = url.parse(req.url, true).query;
        var parts = splitOnFirst(qs["message"], " ");
        if (!parts[0].trim()) return;
        let request = new PostRawToChannel();
        request.from = sub.id;
        request.channel = CHANNEL;    
        request.selector = parts[0].trim();
        request.message = parts.length == 2 ? parts[1].trim() : null;
        client.serviceClient.post(request);
        res.end();
    }
};

const MimeTypes = {
    "html": "text/html",
    "css": "text/css"
}

const handleFile = (path:string, res:http.ServerResponse) => {
    if (path.startsWith("/"))
        path = path.substring(1);

    fs.readFile(path, (err,data) => {
        if (err) {
            res.writeHead(400, err);
            res.end();
            return;
        }
        var parts = splitOnLast(path, ".");
        if (parts.length != 2)
            throw new Error("Unknown file extension for " + path);
        var contentType = MimeTypes[parts[1]];

        res.writeHead(200, {
            "Content-Type": contentType,
            "Content-Length": data.length 
        });

        res.end(data);
    });
}

const server = http.createServer((req,res) => {
    var pathInfo = splitOnFirst(req.url, "?")[0];
    var handler = HANDLERS[pathInfo];
    if (handler) {
        if (pathInfo != "/state")
            console.log(`executing ${pathInfo}...`);
        handler(req,res);
    } else {
        var path = pathInfo.startsWith("/")
            ? pathInfo.substring(1)
            : pathInfo;
        fs.exists(path, exists => {
            if (exists) {
                handleFile(pathInfo, res);
            } else {
                res.writeHead(404, `${pathInfo} was not found`);
                res.end();
            }
        });
    }
});

server.listen(8080);
console.log("listening on http://localhost:8080");