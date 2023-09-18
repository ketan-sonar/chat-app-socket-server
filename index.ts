import { Server } from "socket.io";

const io = new Server(8900, {
  cors: { origin: "https://chat-app-site-eta.vercel.app/" },
});

let users: { userId: string; socketId: string }[] = [];

const addUser = (userId: string, socketId: string) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId: userId, socketId: socketId });
};

const removeUser = (socketId: string) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId: string) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("addUser", (userId: string) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on(
    "sendMessage",
    ({
      senderId,
      receiverId,
      text,
      timestamp,
    }: {
      senderId: string;
      receiverId: string;
      text: string;
      timestamp: Date;
    }) => {
      const receiver = getUser(receiverId);
      io.to(receiver?.socketId as string).emit("getMessage", {
        senderId,
        text,
        timestamp,
      });
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});
