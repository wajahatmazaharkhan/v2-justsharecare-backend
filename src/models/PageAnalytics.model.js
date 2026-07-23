import mongoose from "mongoose";

const PageAnalyticsSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    default: null,
  },
  ip: {
    type:String
  },
  userAgent:String,
  createdAt:{
    type:Date,
    default:Date.now
  }
});

export const PageAnalytics = mongoose.model("PageAnalytics",PageAnalyticsSchema)
