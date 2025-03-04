import mongoose from "mongoose";

const gameRequestSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  gameType: { type: String, required: true, default: "RPS" },
  status: { type: String, enum: ["pending", "accepted", "completed"], default: "pending" },
  moves: { type: Map, of: String, default: {} }, // { player1: "rock", player2: "scissors" }
  createdAt: { type: Date, default: Date.now }
});

// Using `_id` as `roomId`
export const GameRequest = mongoose.model("GameRequest", gameRequestSchema);

