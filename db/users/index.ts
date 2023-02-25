import { IUser } from '../../interfaces';

const users: IUser[] = [];

export function addUser(payload: IUser) {
  users.push(payload);
  return payload;
}

export function getUser({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}): IUser | [] {
  if (!userId || !roomId)
    throw Error('UserId or roomId is missing - getUser');
  return (
    users.find(
      (user: IUser) =>
        user.userId === userId && user.roomId === roomId
    ) || []
  );
}

export function removeUser({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) {
  if (!userId || !roomId)
    throw Error('UserId or roomId is missing - getUser');
  const index = users.findIndex(
    (user: IUser) => user.userId === userId && user.roomId === roomId
  );

  const deletedUser = users[index];
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }

  return deletedUser;
}

export const getUsers = ({
  roomId,
}: {
  roomId: string;
}): IUser[] | [] => {
  if (!roomId) throw Error('roomId is missing');
  return users.filter((user: IUser) => user.roomId === roomId) || [];
};

export const toggleUserVisibility = ({
  userId,
  roomId,
  visibility,
}: {
  userId: string;
  roomId: string;
  visibility: boolean;
}) => {
  for (let i = 0; i <= users.length; i++) {
    if (users[i]?.roomId === roomId && users[i]?.userId === userId) {
      users[i].visibility = visibility;
      break;
    }
  }
};

export const userDisconnected = ({ userId }: { userId: string }) => {
  for (let i = 0; i <= users.length; i++) {
    if (users[i]?.userId === userId) {
      users[i].visibility = true;
      break;
    }
  }
};
