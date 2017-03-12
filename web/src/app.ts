import { 
    ServerEventsClient,
    ServerEventConnect,
    ServerEventMessage, 
    ServerEventCommand,
    splitOnFirst,
} from "servicestack-client";
import { PostChatToChannel, PostRawToChannel } from "./dtos";

var CHANNEL = "";
var BASEURL = "";
var MESSAGES = {};
var sub:ServerEventConnect = null;

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const $msgs = $("#messages > div") as HTMLDivElement;
const $users = $("#users > div") as HTMLDivElement;

const addMessage = (x:ServerEventMessage) => 
    addMessageHtml(`<div><b>${x.selector}</b> <span class="json" title=${x.json}>${x.json}</span></div>`);
const addMessageHtml = (html:string) => 
    (MESSAGES[CHANNEL] || (MESSAGES[CHANNEL] = [])).push(html);
const refreshMessages = () => 
    $msgs.innerHTML = (MESSAGES[CHANNEL] || []).reverse().join('');
const refresh = (e:ServerEventMessage) => {
    addMessage(e); 
    refreshMessages();
    refreshUsers();
}; 

var client:ServerEventsClient = null;
const refreshUsers = async () => {
    var users = await client.getChannelSubscribers();
    users.sort((x,y) => y.userId.localeCompare(x.userId));

    var usersMap = {};
    var userIds = Object.keys(usersMap);
    var html = users.map(x => 
        `<div class="${x.userId == sub.userId ? 'me' : ''}"><img src="${x.profileUrl}" /><b>@${x.displayName}</b><i>#${x.userId}</i><br/></div>`);
    $users.innerHTML = html.join('');
};

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

startListening();

const sendChat = () => {
    let request = new PostChatToChannel();
    request.from = sub.id;
    request.channel = CHANNEL;    
    request.selector = "cmd.chat";
    request.message = $("#txtChat").value;
    client.serviceClient.post(request);
};
const sendRaw = () => {
    var parts = splitOnFirst($("#txtRaw").value, " ");
    if (!parts[0].trim()) return;
    let request = new PostRawToChannel();
    request.from = sub.id;
    request.channel = CHANNEL;    
    request.selector = parts[0].trim();
    request.message = parts.length == 2 ? parts[1].trim() : null;
    client.serviceClient.post(request);
};

$("#btnChange").onclick = startListening;
$$("#baseUrl,#channel").forEach(x => x.onkeydown = e => e.keyCode == 13 ? startListening() : null);
$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = e => e.keyCode == 13 ? sendChat() : null;
$("#rawOptions").onchange = function(e) { $("#txtRaw").value = this.value; };
$("#btnSendRaw").onclick = sendRaw;
$("#txtRaw").onkeydown = e => e.keyCode == 13 ? sendRaw() : null;
