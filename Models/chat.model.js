import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",  // Reference to the User model
        }
    ],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }] // Users who have seen the message
        }
    ],
    lastMessage: {
        text: { type: String },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        timestamp: { type: Date }
    }
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);
