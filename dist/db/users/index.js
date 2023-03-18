"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDisconnected = exports.toggleUserVisibility = exports.getUsers = exports.removeUser = exports.getUser = exports.addUser = void 0;
const users = [];
function addUser(payload) {
    users.push(payload);
    return payload;
}
exports.addUser = addUser;
function getUser({ userId, roomId, }) {
    if (!userId || !roomId)
        throw Error('UserId or roomId is missing - getUser');
    return (users.find((user) => user.userId === userId && user.roomId === roomId) || []);
}
exports.getUser = getUser;
function removeUser({ userId, roomId, }) {
    if (!userId || !roomId)
        throw Error('UserId or roomId is missing - getUser');
    const index = users.findIndex((user) => user.userId === userId && user.roomId === roomId);
    const deletedUser = users[index];
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
    return deletedUser;
}
exports.removeUser = removeUser;
const getUsers = ({ roomId, }) => {
    if (!roomId)
        throw Error('roomId is missing');
    return users.filter((user) => user.roomId === roomId) || [];
};
exports.getUsers = getUsers;
const toggleUserVisibility = ({ userId, roomId, visibility, }) => {
    var _a, _b;
    for (let i = 0; i <= users.length; i++) {
        if (((_a = users[i]) === null || _a === void 0 ? void 0 : _a.roomId) === roomId && ((_b = users[i]) === null || _b === void 0 ? void 0 : _b.userId) === userId) {
            users[i].visibility = visibility;
            break;
        }
    }
};
exports.toggleUserVisibility = toggleUserVisibility;
const userDisconnected = ({ userId }) => {
    var _a;
    for (let i = 0; i <= users.length; i++) {
        if (((_a = users[i]) === null || _a === void 0 ? void 0 : _a.userId) === userId) {
            users[i].visibility = true;
            break;
        }
    }
};
exports.userDisconnected = userDisconnected;
