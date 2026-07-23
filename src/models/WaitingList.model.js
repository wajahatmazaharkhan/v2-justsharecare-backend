import mongoose from "mongoose";

const WaitingSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const WaitingList = mongoose.model("WaitingList", WaitingSchema);
