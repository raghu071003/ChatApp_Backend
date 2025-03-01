import app from "./app.js";
import connectDb from "./db/index.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chat } from "./Models/chat.model.js";

// Load environment variables
dotenv.config({ path: "./.env" });

// Create HTTP Server
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not defined
// Connect Database & Start Server
connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
  let users = new Map();

  io.on("connection", (socket) => {
    console.log("🔗 A user connected:", socket.id);
    
    socket.on("join", (userId) => {
      users.set(userId, socket.id);
      console.log(`✅ User ${userId} connected with socket ID: ${socket.id}`);
      
    });
  
    

socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
        // Find an existing chat between these users
        let chat = await Chat.findOne({
            members: { $all: [senderId, receiverId] }
        });

        // If no chat exists, create a new one
        if (!chat) {
            chat = new Chat({
                members: [senderId, receiverId],
                messages: [],
                lastMessage: {}
            });
        }

        // Create the new message
        const newMessage = {
            sender: senderId,
            text: message,
            timestamp: new Date(),
            seenBy: [senderId]  // Message is seen by the sender immediately
        };

        // Push the new message to the chat
        chat.messages.push(newMessage);
        chat.lastMessage = {
            text: message,
            sender: senderId,
            timestamp: new Date()
        };

        // Save the chat to the database
        await chat.save();

        // Get the receiver's socket ID from the users map
        const receiverSocketId = users.get(receiverId);
        console.log(`${senderId} -> ${message} -> ${receiverId}`);

        // If receiver is online, send the message
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
});

  
    socket.on("disconnect", () => {
      users.forEach((value, key) => {
        if (value === socket.id) {
          users.delete(key);
        }
      });
      console.log("❌ A user disconnected:", socket.id);
    });
  });