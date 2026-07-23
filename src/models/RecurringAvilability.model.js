import mongoose from "mongoose";

const recurringAvailabilitySchema = new mongoose.Schema(
  {
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      required: true,
    },
    dayOfWeek: {
      type: Number, //0 - 6
      //   0 - Sunday && 6 - Saturday
      enum: [0, 1, 2, 3, 4, 5, 6],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

recurringAvailabilitySchema.index(
  {
    counsellor: 1,
    dayOfWeek: 1,
    startTime: 1,
    endTime: 1,
  },
  { unique: true }
);

recurringAvailabilitySchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    return next(new Error("endTime must be after startTime"));
  }
  next();
});

export default mongoose.model(
  "RecurringAvailability",
  recurringAvailabilitySchema
);
