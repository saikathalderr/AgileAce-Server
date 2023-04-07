"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const events_1 = require("./events");
const users_1 = require("./db/users");
const estimates_1 = require("./db/estimates");
const config_1 = __importDefault(require("config"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const IO = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5173',
    },
});
const port = config_1.default.get('port') || 3000;
app.get('/', (req, res) => {
    res.send('Express with Ts server is up and running...');
});
IO.on('connection', (socket) => {
    console.log(`⚡️: ${socket.id} user just connected!`);
    socket.on(events_1.createRoomEvent, (payload) => {
        try {
            const { roomId } = payload;
            (0, users_1.addUser)(payload);
            socket.join(roomId);
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on(events_1.joinRoomEvent, (payload) => {
        try {
            const { roomId } = payload;
            (0, users_1.addUser)(payload);
            socket.join(roomId);
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on(events_1.fetchRoomDataEvent, (payload) => {
        try {
            const { roomId } = payload;
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on(events_1.leaveRoomEvent, (payload) => {
        try {
            const { roomId, userId } = payload;
            const deletedUser = (0, users_1.removeUser)({ userId, roomId });
            socket.leave(roomId);
            IO.to(roomId).emit(events_1.userLeftEvent, `${deletedUser.fullName} left`);
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on(events_1.toggleUserVisibilityEvent, (payload) => {
        const { user, visibilityStatus } = payload;
        const { roomId, userId } = user;
        (0, users_1.toggleUserVisibility)({
            visibility: visibilityStatus,
            roomId,
            userId,
        });
        fetchRoomData({ socket, roomId });
    });
    socket.on(events_1.giveEstimateEvent, (payload) => {
        try {
            const { roomId } = payload;
            (0, estimates_1.addEstimate)(payload);
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on(events_1.toggleEstimateVisibilityEvent, (payload) => {
        try {
            const { roomId } = payload;
            const notEstimates = !(0, estimates_1.getRoomEstimates)({ roomId }).length;
            if (notEstimates)
                throw new Error('no estimates on this room yet!');
            (0, estimates_1.toggleEstimateVisibility)({ roomId });
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on(events_1.resetEstimatesEvent, (payload) => {
        try {
            const { roomId } = payload;
            const notEstimates = !(0, estimates_1.getRoomEstimates)({ roomId }).length;
            if (notEstimates)
                throw new Error('no estimates on this room yet!');
            (0, estimates_1.resetEstimates)({ roomId });
            fetchRoomData({ socket, roomId });
        }
        catch (e) {
            console.error(e.message);
            return e.message;
        }
    });
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
        (0, users_1.userDisconnected)({ userId: socket.id });
    });
});
server.listen(port, () => {
    console.log(`⚡️: server is running on ${port}`);
});
function fetchRoomData({ socket, roomId }) {
    if (!socket || !roomId)
        return;
    try {
        const args = {
            room: roomId,
            users: (0, users_1.getUsers)({ roomId }),
            estimates: (0, estimates_1.getRoomEstimates)({ roomId }),
        };
        IO.to(roomId).emit(events_1.getRoomDataEvent, args);
    }
    catch (e) {
        console.error(e.message);
        return e.message;
    }
}
