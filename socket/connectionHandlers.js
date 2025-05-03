import { UserSession } from "../Models/userSession.model.js";

export const handleConnectionEvents = (io, socket) => {
  const emitOnlineUsers = async()=>{
    const users = await UserSession.find({},'userId');
    io.emit('update-online-users',users.map(u=>u.userId))
  }
  socket.on("join", async (userId) => {
    try {
      await UserSession.findOneAndUpdate(
        { userId },
        { socketId: socket.id, connectedAt: new Date() },
        { upsert: true, new: true }
      );
      await emitOnlineUsers();
      console.log(`✅ User ${userId} connected with socket ID: ${socket.id}`);
    } catch (error) {
      console.error("Error storing user session:", error);
    }
  });

  socket.on("disconnectUser", async () => {
    try {
      const disconnectedUser = await UserSession.findOneAndDelete({ socketId: socket.id });
      await emitOnlineUsers();
      if (disconnectedUser) {
        console.log(`❌ User ${disconnectedUser.userId} disconnected.`);
      } else {
        console.log("❌ A user disconnected:", socket.id);
      }
    } catch (error) {
      console.error("Error removing user session:", error);
    }
  });
};
