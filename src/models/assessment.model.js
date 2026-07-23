import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    feeling: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },

    duration: {
      type: String,
      required: true,
      enum: ["Just Started", "Few weeks", "Few months", "Long time"],
    },

    spokenBefore: {
      type: String,
      required: true,
      enum: ["Yes", "No", "Prefer not to say"],
    },

    supportType: {
      type: String,
      required: true,
      enum: ["chat", "voice", "video"],
    },

    matchingPref: {
      type: String,
      required: true,
      enum: ["auto", "manual"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
