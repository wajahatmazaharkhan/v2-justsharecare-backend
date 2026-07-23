import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config/config.js";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String },
    displayName: { type: String },
    profilePic: { type: String },
    fullname: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    phone_number: {
      type: String,
      sparse: true,
    },
    Password: {
      type: String,
    },

    accessToken: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "counsellor", "admin"],
      default: "user",
      index: true,
    },

    dob: Date,
    gender: String,

    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },

    preferred_language: String,
    timezone: String,
    last_login: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    passwordOtpVerify: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: null,
    },
    bookingAssessment: [
      {
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assessment",
        },
        takenAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        CounsellorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Counsellor",
        },
        visitDate: { type: Date, default: Date.now },
        notes: { type: String }, // optional notes about the session
      },
    ],
  },
  { timestamps: true }
);

/******************** Hash Password ********************/
userSchema.pre("save", async function (next) {
  if (!this.isModified("Password") || !this.Password) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
  } catch (error) {
    next(error);
  }
});

/******************** Generate Access Token ********************/
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
      fullname: this.fullname,
      email: this.email,
      role: this.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY_TIME } // 15 minutes
  );
};

/******************** Generate Refresh Token ********************/
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY_TIME }
  ); // 7 days
};

/******************** Compare Password ********************/
userSchema.methods.comparePassword = function (Password) {
  return bcrypt.compare(Password, this.Password);
};

export const User = mongoose.model("User", userSchema);
