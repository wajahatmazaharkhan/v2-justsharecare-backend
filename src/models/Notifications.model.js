import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    channel: {
      type: String,
      enum: ["in-app", "email", "sms", "push"],
      default: "in-app",
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["system", "meeting", "chat", "booking", "payment", "reminder"],
      default: "system",
    },

    meta: {
      type: mongoose.Schema.Types.Mixed, // flexible JSON
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
