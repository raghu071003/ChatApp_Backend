import { Server } from "socket.io";
import { handleGameEvents } from "./gameHandlers.js";
import { handleChatEvents } from "./chatHandlers.js";
import { handleConnectionEvents } from "./connectionHandlers.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 A user connected:", socket.id);

    handleConnectionEvents(io, socket);
    handleChatEvents(io, socket);
    handleGameEvents(io, socket);
  });

  return io;
};
