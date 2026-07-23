import mongoose from "mongoose";
import { User } from "../models/User.models.js";

const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isGroup: { type: Boolean, default: false },
  title: String,
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session"
  },
  lastMessageAt: Date
}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
