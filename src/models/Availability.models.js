import mongoose from "mongoose";

//========== [USES REGEX VALIDATION] ==========//
// This enforces 24-hour HH:mm format.

const availabilitySchema = new mongoose.Schema(
  {
    counsellorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate slots
availabilitySchema.index(
  { counsellorId: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

// speedup availability lookups
availabilitySchema.index({
  counsellorId: 1,
  date: 1,
  isBooked: 1,
});

// Validate time range
availabilitySchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    return next(new Error("endTime must be after startTime"));
  }
  this.date.setHours(0, 0, 0, 0);
  next();
});

export default mongoose.model("Availability", availabilitySchema);
