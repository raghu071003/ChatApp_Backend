import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  socketId: { type: String, required: true },
  connectedAt: { type: Date, default: Date.now },
});

export const UserSession = mongoose.model("UserSession", userSessionSchema);
