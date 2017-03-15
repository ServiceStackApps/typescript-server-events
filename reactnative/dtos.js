/* Options:
Date: 2017-03-14 19:21:49
Version: 4.00
Tip: To override a DTO option, remove "//" prefix before updating
BaseUrl: http://chat.servicestack.net

//GlobalNamespace:
//MakePropertiesOptional: True
//AddServiceStackTypes: True
//AddResponseStatus: False
//AddImplicitVersion:
//AddDescriptionAsComments: True
//IncludeTypes:
//ExcludeTypes:
//DefaultImports:
*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @DataContract
var ResponseError = (function () {
    function ResponseError() {
    }
    return ResponseError;
}());
exports.ResponseError = ResponseError;
// @DataContract
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
// @DataContract
var AuthenticateResponse = (function () {
    function AuthenticateResponse() {
    }
    return AuthenticateResponse;
}());
exports.AuthenticateResponse = AuthenticateResponse;
// @DataContract
var AssignRolesResponse = (function () {
    function AssignRolesResponse() {
    }
    return AssignRolesResponse;
}());
exports.AssignRolesResponse = AssignRolesResponse;
// @DataContract
var UnAssignRolesResponse = (function () {
    function UnAssignRolesResponse() {
    }
    return UnAssignRolesResponse;
}());
exports.UnAssignRolesResponse = UnAssignRolesResponse;
// @Route("/channels/{Channel}/raw")
var PostRawToChannel = (function () {
    function PostRawToChannel() {
    }
    PostRawToChannel.prototype.createResponse = function () { };
    PostRawToChannel.prototype.getTypeName = function () { return "PostRawToChannel"; };
    return PostRawToChannel;
}());
exports.PostRawToChannel = PostRawToChannel;
// @Route("/channels/{Channel}/chat")
var PostChatToChannel = (function () {
    function PostChatToChannel() {
    }
    PostChatToChannel.prototype.createResponse = function () { return new ChatMessage(); };
    PostChatToChannel.prototype.getTypeName = function () { return "PostChatToChannel"; };
    return PostChatToChannel;
}());
exports.PostChatToChannel = PostChatToChannel;
// @Route("/chathistory")
var GetChatHistory = (function () {
    function GetChatHistory() {
    }
    GetChatHistory.prototype.createResponse = function () { return new GetChatHistoryResponse(); };
    GetChatHistory.prototype.getTypeName = function () { return "GetChatHistory"; };
    return GetChatHistory;
}());
exports.GetChatHistory = GetChatHistory;
// @Route("/reset")
var ClearChatHistory = (function () {
    function ClearChatHistory() {
    }
    ClearChatHistory.prototype.createResponse = function () { };
    ClearChatHistory.prototype.getTypeName = function () { return "ClearChatHistory"; };
    return ClearChatHistory;
}());
exports.ClearChatHistory = ClearChatHistory;
// @Route("/reset-serverevents")
var ResetServerEvents = (function () {
    function ResetServerEvents() {
    }
    ResetServerEvents.prototype.createResponse = function () { };
    ResetServerEvents.prototype.getTypeName = function () { return "ResetServerEvents"; };
    return ResetServerEvents;
}());
exports.ResetServerEvents = ResetServerEvents;
// @Route("/channels/{Channel}/object")
var PostObjectToChannel = (function () {
    function PostObjectToChannel() {
    }
    PostObjectToChannel.prototype.createResponse = function () { };
    PostObjectToChannel.prototype.getTypeName = function () { return "PostObjectToChannel"; };
    return PostObjectToChannel;
}());
exports.PostObjectToChannel = PostObjectToChannel;
// @Route("/account")
var GetUserDetails = (function () {
    function GetUserDetails() {
    }
    GetUserDetails.prototype.createResponse = function () { return new GetUserDetailsResponse(); };
    GetUserDetails.prototype.getTypeName = function () { return "GetUserDetails"; };
    return GetUserDetails;
}());
exports.GetUserDetails = GetUserDetails;
// @Route("/auth")
// @Route("/auth/{provider}")
// @Route("/authenticate")
// @Route("/authenticate/{provider}")
// @DataContract
var Authenticate = (function () {
    function Authenticate() {
    }
    Authenticate.prototype.createResponse = function () { return new AuthenticateResponse(); };
    Authenticate.prototype.getTypeName = function () { return "Authenticate"; };
    return Authenticate;
}());
exports.Authenticate = Authenticate;
// @Route("/assignroles")
// @DataContract
var AssignRoles = (function () {
    function AssignRoles() {
    }
    AssignRoles.prototype.createResponse = function () { return new AssignRolesResponse(); };
    AssignRoles.prototype.getTypeName = function () { return "AssignRoles"; };
    return AssignRoles;
}());
exports.AssignRoles = AssignRoles;
// @Route("/unassignroles")
// @DataContract
var UnAssignRoles = (function () {
    function UnAssignRoles() {
    }
    UnAssignRoles.prototype.createResponse = function () { return new UnAssignRolesResponse(); };
    UnAssignRoles.prototype.getTypeName = function () { return "UnAssignRoles"; };
    return UnAssignRoles;
}());
exports.UnAssignRoles = UnAssignRoles;
