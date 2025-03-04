import { Chat } from "../Models/chat.model.js";
import { UserSession } from "../Models/userSession.model.js";

export const handleChatEvents = (io, socket) => {
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      let chat = await Chat.findOne({ members: { $all: [senderId, receiverId] } });

      if (!chat) {
        chat = new Chat({
          members: [senderId, receiverId],
          messages: [],
          lastMessage: {},
        });
      }

      const newMessage = {
        sender: senderId,
        text: message,
        timestamp: new Date(),
        seenBy: [senderId],
      };

      chat.messages.push(newMessage);
      chat.lastMessage = {
        text: message,
        sender: senderId,
        timestamp: new Date(),
      };

      await chat.save();

      const receiverSession = await UserSession.findOne({ userId: receiverId });

      if (receiverSession) {
        io.to(receiverSession.socketId).emit("receiveMessage", { senderId, message });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
};
