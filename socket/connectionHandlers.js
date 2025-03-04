import { UserSession } from "../Models/userSession.model.js";

export const handleConnectionEvents = (io, socket) => {
  socket.on("join", async (userId) => {
    try {
      await UserSession.findOneAndUpdate(
        { userId },
        { socketId: socket.id, connectedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log(`✅ User ${userId} connected with socket ID: ${socket.id}`);
    } catch (error) {
      console.error("Error storing user session:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const disconnectedUser = await UserSession.findOneAndDelete({ socketId: socket.id });
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
