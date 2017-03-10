import { 
    ServerEventsClient,
    ServerEventConnect,
    ServerEventMessage, 
    ServerEventCommand,
} from "servicestack-client";

var channel = "";
var baseUrl = "";
var MESSAGES = {};

const wrap = <T>(x:T, fn:(x:T) => any) => fn(x);
const $ = sel => document.querySelectorAll(sel);

const $msgs = $("#messages > div")[0] as HTMLDivElement;
const $users = $("#users > div")[0] as HTMLDivElement;

var sub:ServerEventConnect = null;

const addMessage = (e:ServerEventMessage) => {
    var channelMsgs:ServerEventMessage[] = MESSAGES[e.channel] || (MESSAGES[e.channel] = []);
    channelMsgs.push(e);
};
const refreshMessages = () => {
    var html = (MESSAGES[channel] || []).reverse().map(x => 
        `<div><b>${x.selector}</b> <span>${x.json}</span></div>`);
    $msgs.innerHTML = html.join('');
};
const refresh = (e:ServerEventMessage) => {
    addMessage(e); 
    refreshMessages();
    refreshUsers();
}; 

var client:ServerEventsClient = null;
const refreshUsers = async () => {
    var users = await client.getChannelSubscribers();
    users.sort((x,y) => x.userId.localeCompare(y.userId));

    var usersMap = {};
    var userIds = Object.keys(usersMap);
    var html = users.map(u => 
        `<div class="${u.userId == sub.userId ? 'me' : ''}"><img src="${u.profileUrl}" /><b>@${u.displayName}</b><i>#${u.userId}</i><br/></div>`);
    $users.innerHTML = html.join('');
};

const startListening = () => {
    baseUrl = $("#baseUrl")[0].value;
    channel = $("#channel")[0].value;
    if (client != null)
        client.stop();

    console.log("Connecting to ", baseUrl, channel);
    
    client = new ServerEventsClient(baseUrl, [channel], {
        handlers: {
            onConnect: (e:ServerEventConnect) => {
                sub = e;
                refresh(e);
            },
            onJoin: refresh,
            onLeave: refresh,
            onUpdate: refresh,
            onMessage: (e:ServerEventMessage) => {
                addMessage(e);
                refreshMessages();
            }
        }
    }).start();
}

startListening();
$("#btnChange")[0].onclick = startListening;
$("input").forEach(x => x.onkeydown = e => e.keyCode == 13 ? startListening() : null);
