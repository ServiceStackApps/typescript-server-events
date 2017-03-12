"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResponseError = (function () {
    function ResponseError() {
    }
    return ResponseError;
}());
exports.ResponseError = ResponseError;
var ResponseStatus = (function () {
    function ResponseStatus() {
    }
    return ResponseStatus;
}());
exports.ResponseStatus = ResponseStatus;
var CustomType = (function () {
    function CustomType() {
    }
    return CustomType;
}());
exports.CustomType = CustomType;
var SetterType = (function () {
    function SetterType() {
    }
    return SetterType;
}());
exports.SetterType = SetterType;
var ChatMessage = (function () {
    function ChatMessage() {
    }
    return ChatMessage;
}());
exports.ChatMessage = ChatMessage;
var GetChatHistoryResponse = (function () {
    function GetChatHistoryResponse() {
    }
    return GetChatHistoryResponse;
}());
exports.GetChatHistoryResponse = GetChatHistoryResponse;
var GetUserDetailsResponse = (function () {
    function GetUserDetailsResponse() {
    }
    return GetUserDetailsResponse;
}());
exports.GetUserDetailsResponse = GetUserDetailsResponse;
var AuthenticateResponse = (function () {
    function AuthenticateResponse() {
    }
    return AuthenticateResponse;
}());
exports.AuthenticateResponse = AuthenticateResponse;
var AssignRolesResponse = (function () {
    function AssignRolesResponse() {
    }
    return AssignRolesResponse;
}());
exports.AssignRolesResponse = AssignRolesResponse;
var UnAssignRolesResponse = (function () {
    function UnAssignRolesResponse() {
    }
    return UnAssignRolesResponse;
}());
exports.UnAssignRolesResponse = UnAssignRolesResponse;
var PostRawToChannel = (function () {
    function PostRawToChannel() {
    }
    PostRawToChannel.prototype.createResponse = function () { };
    PostRawToChannel.prototype.getTypeName = function () { return "PostRawToChannel"; };
    return PostRawToChannel;
}());
exports.PostRawToChannel = PostRawToChannel;
var PostChatToChannel = (function () {
    function PostChatToChannel() {
    }
    PostChatToChannel.prototype.createResponse = function () { return new ChatMessage(); };
    PostChatToChannel.prototype.getTypeName = function () { return "PostChatToChannel"; };
    return PostChatToChannel;
}());
exports.PostChatToChannel = PostChatToChannel;
var GetChatHistory = (function () {
    function GetChatHistory() {
    }
    GetChatHistory.prototype.createResponse = function () { return new GetChatHistoryResponse(); };
    GetChatHistory.prototype.getTypeName = function () { return "GetChatHistory"; };
    return GetChatHistory;
}());
exports.GetChatHistory = GetChatHistory;
var ClearChatHistory = (function () {
    function ClearChatHistory() {
    }
    ClearChatHistory.prototype.createResponse = function () { };
    ClearChatHistory.prototype.getTypeName = function () { return "ClearChatHistory"; };
    return ClearChatHistory;
}());
exports.ClearChatHistory = ClearChatHistory;
var ResetServerEvents = (function () {
    function ResetServerEvents() {
    }
    ResetServerEvents.prototype.createResponse = function () { };
    ResetServerEvents.prototype.getTypeName = function () { return "ResetServerEvents"; };
    return ResetServerEvents;
}());
exports.ResetServerEvents = ResetServerEvents;
var PostObjectToChannel = (function () {
    function PostObjectToChannel() {
    }
    PostObjectToChannel.prototype.createResponse = function () { };
    PostObjectToChannel.prototype.getTypeName = function () { return "PostObjectToChannel"; };
    return PostObjectToChannel;
}());
exports.PostObjectToChannel = PostObjectToChannel;
var GetUserDetails = (function () {
    function GetUserDetails() {
    }
    GetUserDetails.prototype.createResponse = function () { return new GetUserDetailsResponse(); };
    GetUserDetails.prototype.getTypeName = function () { return "GetUserDetails"; };
    return GetUserDetails;
}());
exports.GetUserDetails = GetUserDetails;
var Authenticate = (function () {
    function Authenticate() {
    }
    Authenticate.prototype.createResponse = function () { return new AuthenticateResponse(); };
    Authenticate.prototype.getTypeName = function () { return "Authenticate"; };
    return Authenticate;
}());
exports.Authenticate = Authenticate;
var AssignRoles = (function () {
    function AssignRoles() {
    }
    AssignRoles.prototype.createResponse = function () { return new AssignRolesResponse(); };
    AssignRoles.prototype.getTypeName = function () { return "AssignRoles"; };
    return AssignRoles;
}());
exports.AssignRoles = AssignRoles;
var UnAssignRoles = (function () {
    function UnAssignRoles() {
    }
    UnAssignRoles.prototype.createResponse = function () { return new UnAssignRolesResponse(); };
    UnAssignRoles.prototype.getTypeName = function () { return "UnAssignRoles"; };
    return UnAssignRoles;
}());
exports.UnAssignRoles = UnAssignRoles;
//# sourceMappingURL=dtos.js.map