import express, { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import {
  IEstimate,
  ILeaveRoom,
  IRoom,
  IRoomData,
  IToggleUserVisibility,
  IUser,
} from './interfaces';
import {
  createRoomEvent,
  fetchRoomDataEvent,
  getRoomDataEvent,
  giveEstimateEvent,
  joinRoomEvent,
  leaveRoomEvent,
  resetEstimatesEvent,
  toggleEstimateVisibilityEvent,
  toggleUserVisibilityEvent,
  userLeftEvent,
} from './events';
import {
  addUser,
  getUsers,
  removeUser,
  toggleUserVisibility,
  userDisconnected,
} from './db/users';
import {
  addEstimate,
  getRoomEstimates, resetEstimates,
  toggleEstimateVisibility,
} from './db/estimates';

dotenv.config();
const app: Express = express();

app.use(cors());

const server = http.createServer(app);
const IO = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5173',
  },
});
const port: Number = Number(process.env.PORT) || 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Express with Ts server is up and running...');
});

IO.on('connection', (socket) => {
  console.log(`⚡️: ${socket.id} user just connected!`);

  socket.on(createRoomEvent, (payload: IRoom) => {
    try {
      const room: string = payload.roomId;
      addUser(payload);
      socket.join(room);
      socket
        .to(room)
        .emit(fetchRoomDataEvent, { roomId: payload.roomId });
    } catch (e: any) {
      console.error(e.message);
      return e.message;
    }
  });

  socket.on(joinRoomEvent, (payload: IRoom) => {
    try {
      const room: string = payload.roomId;
      addUser(payload);
      socket.join(room);
      socket
        .to(room)
        .emit(fetchRoomDataEvent, { roomId: payload.roomId });
    } catch (e: any) {
      console.error(e.message);
      return e.message;
    }
  });

  socket.on(fetchRoomDataEvent, ({ roomId }: { roomId: string }) => {
    try {
      const args: IRoomData = {
        room: roomId,
        users: getUsers({ roomId }),
        estimates: getRoomEstimates({ roomId }),
      };
      socket.emit(getRoomDataEvent, args);
    } catch (e: any) {
      console.error(e.message);
      return e.message;
    }
  });

  socket.on(leaveRoomEvent, (payload: ILeaveRoom) => {
    try {
      const { roomId, userId } = payload;
      const deletedUser: IUser = removeUser({ userId, roomId });
      socket.leave(roomId);
      socket
        .to(roomId)
        .emit(userLeftEvent, `${deletedUser.fullName} left`);
      socket.to(roomId).emit(fetchRoomDataEvent, { roomId });
    } catch (e: any) {
      console.error(e.message);
      return e.message;
    }
  });

  socket.on(
    toggleUserVisibilityEvent,
    (payload: IToggleUserVisibility) => {
      const { user, visibilityStatus } = payload;
      const { roomId, userId } = user;
      toggleUserVisibility({
        visibility: visibilityStatus,
        roomId,
        userId,
      });
      socket.to(roomId).emit(fetchRoomDataEvent, { roomId });
    }
  );

  socket.on(giveEstimateEvent, (payload: IEstimate) => {
    try {
      addEstimate(payload);
    } catch (e: any) {
      console.error(e.message);
      return e.message;
    }
  });

  socket.on(
    toggleEstimateVisibilityEvent,
    (payload: { roomId: string }) => {
      try {
        const { roomId } = payload;
        const notEstimates = !getRoomEstimates({ roomId }).length;
        if (notEstimates)
          throw new Error('no estimates on this room yet!');
        toggleEstimateVisibility({ roomId });
        socket.to(roomId).emit(fetchRoomDataEvent, { roomId });
      } catch (e: any) {
        console.error(e.message);
        return e.message;
      }
    }
  );

  socket.on(resetEstimatesEvent, (payload: { roomId: string }) => {
    try {
      const { roomId } = payload;
      const notEstimates = !getRoomEstimates({ roomId }).length;
      if (notEstimates)
        throw new Error('no estimates on this room yet!');
      resetEstimates({ roomId })
      socket.to(roomId).emit(fetchRoomDataEvent, { roomId });
    } catch (e: any) {
      console.error(e.message);
      return e.message;
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
    userDisconnected({ userId: socket.id });
  });
});

server.listen(port, () => {
  console.log(`⚡️: server is running on ${port}`);
});
