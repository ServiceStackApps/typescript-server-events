import { JsonServiceClient } from "servicestack-client";

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const $msgs = $("#messages > div") as HTMLDivElement;
const $users = $("#users > div") as HTMLDivElement;

const client = new JsonServiceClient("/");

const startListening = () => {
    var baseUrl = $("#baseUrl").value;
    var channel = $("#channel").value;
    client.get("/listen", { baseUrl, channel });
};

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
startListening();

const sendChat = () => client.get("/chat", { message: $("#txtChat").value });
const sendRaw  = () => client.get("/raw",  { message: $("#txtRaw").value });

$("#btnChange").onclick = startListening;
$$("#baseUrl,#channel").forEach(x => x.onkeydown = e => e.keyCode == 13 ? startListening() : null);
$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = e => e.keyCode == 13 ? sendChat() : null;
$("#rawOptions").onchange = function(e) { $("#txtRaw").value = this.value; };
$("#btnSendRaw").onclick = sendRaw;
$("#txtRaw").onkeydown = e => e.keyCode == 13 ? sendRaw() : null;
