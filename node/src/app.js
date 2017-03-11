"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var servicestack_client_1 = require("servicestack-client");
var $ = function (sel) { return document.querySelector(sel); };
var $$ = function (sel) { return document.querySelectorAll(sel); };
var $msgs = $("#messages > div");
var $users = $("#users > div");
var client = new servicestack_client_1.JsonServiceClient("/");
var startListening = function () {
    var baseUrl = $("#baseUrl").value;
    var channel = $("#channel").value;
    client.get("/listen", { baseUrl: baseUrl, channel: channel });
};
var syncState = function () {
    client.get("/state").then(function (state) {
        var html = state.users.map(function (x) {
            return "<div class=\"" + (x.userId == state.sub.userId ? 'me' : '') + "\"><img src=\"" + x.profileUrl + "\" /><b>@" + x.displayName + "</b><i>#" + x.userId + "</i><br/></div>";
        });
        $users.innerHTML = html.join('');
        $msgs.innerHTML = state.messages.reverse().join('');
    });
};
startListening();
setInterval(syncState, 200);
var sendChat = function () { return client.get("/chat", { message: $("#txtChat").value }); };
var sendRaw = function () { return client.get("/raw", { message: $("#txtRaw").value }); };
$("#btnChange").onclick = startListening;
$$("#baseUrl,#channel").forEach(function (x) { return x.onkeydown = function (e) { return e.keyCode == 13 ? startListening() : null; }; });
$("#btnSendChat").onclick = sendChat;
$("#txtChat").onkeydown = function (e) { return e.keyCode == 13 ? sendChat() : null; };
$("#rawOptions").onchange = function (e) { $("#txtRaw").value = this.value; };
$("#btnSendRaw").onclick = sendRaw;
$("#txtChat").onkeydown = function (e) { return e.keyCode == 13 ? sendRaw() : null; };
//# sourceMappingURL=app.js.map