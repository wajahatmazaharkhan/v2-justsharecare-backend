import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";
import bcrypt from "bcryptjs";
//otp service imports
import { sendOtpEmail } from "../services/OtpEmailVerification.js";
import { SendOtpForPassword } from "../services/OtpPasswordReset.services.js";
// validator imports
import {
  SignupValidation,
  LoginValidation,
  AdminLoginValidation,
  UpdateUserStatusValidation,
  UpdateUserRoleValidation,
} from "../validator/User.validation.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ImagekitFileUploader } from "../services/imagekit.services.js";
import passport from "passport";
import { sendWelcomeEmail } from "../services/WelcomeNewUser.js";
import { Appointment } from "../models/Appointments.model.js";
import config from "../../config/config.js";
import jwt from "jsonwebtoken";

// signup user controller function //
export const SignUp = asyncHandler(async (req, res) => {
  const data = SignupValidation.parse(req.body);

  const oldUser = await User.findOne({ email: data.email });
  if (oldUser) {
    return res
      .status(409)
      .json(new ApiError(409, "User with this email already exists!"));
  }

  const newUser = await User.create({
    fullname: data.fullname,
    email: data.email,
    phone_number: data.phone_number,
    Password: data.Password,
    dob: data.dob,
    gender: data.gender,
    timezone: data.timezone,
    preferred_language: data.preferred_language,
  });

  if (!newUser) {
    return res
      .status(400)
      .json(new ApiError(400, "Server Error while creating account!"));
  }

  await sendWelcomeEmail(newUser.fullname, newUser.email);

  const accessToken = jwt.sign(
    {
      userId: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      role: newUser.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY_TIME } // 15 minutes
  );

  const refreshToken = jwt.sign(
    {
      userId: newUser._id,
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY_TIME } // 7 days
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        fullname: newUser.fullname,
        email: newUser.email,
        phone_number: newUser.phone_number,
        dob: newUser.dob,
        gender: newUser.gender,
        timezone: newUser.timezone,
        preferred_language: newUser.preferred_language,
        accessToken,
      },
      "User created successfully"
    )
  );
});

// login user controller function //
export const Login = asyncHandler(async (req, res) => {
  const data = LoginValidation.parse(req.body);

  // get existed user

  const userExisted = await User.findOne({ email: data.email });

  if (!userExisted) {
    return res
      .status(404)
      .json(new ApiError(404, "No Account is associated with this email!"));
  }

  if (userExisted.role === "counsellor") {
    return res
      .status(401)
      .json(new ApiError(401, "Please login through counsellor portal"));
  }

  if (!userExisted.isVerified) {
    return res
      .status(400)
      .json(new ApiError(400, "Verify Account before Logging In!"));
  }

  if (!userExisted.Password) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Account is associated with Google. Please sign in with Google."
        )
      );
  }

  const user = await userExisted.comparePassword(data.Password);

  await User.updateOne(
    { _id: userExisted._id },
    { $set: { last_login: new Date() } }
  );

  const accessToken = jwt.sign(
    {
      userId: userExisted._id,
      fullname: userExisted.fullname,
      email: userExisted.email,
      role: userExisted.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY_TIME }
  ); // 15 minutes

  userExisted.accessToken = accessToken;
  await userExisted.save();

  const refreshToken = jwt.sign(
    {
      userId: userExisted._id,
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY_TIME }
  );

  // cookie option
  const option = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  if (user) {
    res
      .status(200)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            token: accessToken,
            user: {
              id: userExisted._id,
              fullname: userExisted.fullname,
              email: userExisted.email,
              role: userExisted.role,
            },
          },
          "Login Successful"
        )
      );
  } else {
    res.status(401).json(new ApiError(401, "Invalid Email or Password"));
  }
});

export const getAccessToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json(new ApiError(401, "No refresh token provided"));
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const accessToken = user.accessToken;

    return res
      .status(200)
      .json(new ApiResponse(200, { token: accessToken }, "ok"));
  } catch (error) {
    return res
      .status(401)
      .json(new ApiError(401, "Invalid Token provided", error));
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json(new ApiError(401, "No refresh token provided"));
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    console.log("decoded", decoded);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      config.JWT_SECRET,
      { expiresIn: config.ACCESS_TOKEN_EXPIRY_TIME }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
      },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.REFRESH_TOKEN_EXPIRY_TIME }
    );

    user.accessToken = newAccessToken;

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res
      .status(401)
      .json(new ApiError(401, "Invalid or expired refresh token"));
  }
});

// admin Login controller function //
export const adminLogin = asyncHandler(async (req, res) => {
  const data = AdminLoginValidation.parse(req.body);
  console.log("admin login", data);
  const userExisted = await User.findOne({ email: data.email });
  if (!userExisted) {
    return res.status(404).json(new ApiError(404, "User Not Found"));
  }

  if (userExisted.role != "admin") {
    return res.status(402).json(new ApiError(402, "Only Admins can Login"));
  }

  const user = await userExisted.comparePassword(data.Password);
  if (!user) {
    return res.status(400).json(new ApiError(400, "Invalid Email or Password"));
  }
  const token = userExisted.generateAuthToken();

  // cookie option
  const option = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    // secure: false, // Set to true if using HTTPS
  };

  if (user) {
    res
      .status(200)
      .cookie("authToken", token, option)
      .json(
        new ApiResponse(
          200,
          {
            token,
            user: {
              id: userExisted._id,
              fullname: userExisted.fullname,
              email: userExisted.email,
              role: userExisted.role,
            },
          },
          "Login Successful"
        )
      );
  } else {
    res.status(401).json(new ApiError(401, "Invalid Email or Password"));
  }
});

// function for send verify otp using nodemailer
export const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.params; // use lowercase standard

  if (!email) {
    return res.status(400).json(new ApiError(400, "Email Address is Required"));
  }

  // ✅ Find user by email
  const userFound = await User.findOne({ email });

  if (!userFound) {
    return res.status(404).json(new ApiError(404, "User not Found"));
  }

  // isVerified Already
  if (userFound.isVerified) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "Already Verified!"));
  }

  // ✅ Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // ✅ Hash OTP
  const hashedOtp = await bcrypt.hash(otp, 10);

  // ✅ Expiry time (5 minutes)
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  // ✅ Save OTP in DB
  userFound.otp = hashedOtp;
  userFound.otpExpiry = otpExpiry;
  await userFound.save();

  // ✅ Send OTP email
  await sendOtpEmail(userFound.fullname, userFound.email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully!"));
});

// NEWLY ADDED: Verify OTP Function

export const VerifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // 1. Basic Validation
  if (!email || !otp) {
    return res.status(400).json(new ApiError(400, "OTP and Email is required"));
  }

  // 2. Find User
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  // 3. Check if OTP is expired
  if (user.otpExpiry && user.otpExpiry < Date.now()) {
    return res.status(400).json(new ApiError(400, "OTP Expired. Request new!"));
  }

  // 4. Verify OTP

  const isMatch = await bcrypt.compare(otp, user.otp || "");

  if (!isMatch) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid OTP. Please check once!"));
  }

  // 5. Success -
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.isVerified = true; // Assuming you have an 'is_verified' field in model

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified Successfully!"));
});

// get user history
export const getHistory = asyncHandler(async (req, res) => {
  const { counsellorId } = req.params;

  if (!counsellorId) {
    return res.status(400).json(new ApiError(400, "Counsellor ID is required"));
  }

  // ✅ Find counsellor and populate history.customerId to get user details
  const counsellor = await Counsellor.findById(counsellorId).populate(
    "history.customerId",
    "fullname email phone_number"
  );

  if (!counsellor) {
    return res.status(404).json(new ApiError(404, "Counsellor not Found"));
  }

  // ✅ Optionally sort by latest visit first
  const sortedHistory = counsellor.history.sort(
    (a, b) => b.visitDate - a.visitDate
  );

  return res.status(200).json(
    new ApiResponse(200, {
      history: sortedHistory,
    })
  );
});

export const passwordOtp = asyncHandler(async (req, res) => {
  const { Email } = req.body;
  const user = await User.findOne({ email: Email });
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP and expiry
  user.otp = hashedOtp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP Email
  SendOtpForPassword(user.fullname, user.email, otp);

  return res.status(200).json(new ApiResponse(200, "OTP sent successfully!"));
});

export const VerifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // 1. Basic Validation
  if (!email || !otp) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and OTP are required"));
  }

  // 2. Find User
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  // 3. Check if OTP is expired
  if (user.otpExpiry && user.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json(new ApiError(400, "OTP has expired. Please request new one"));
  }

  // 4. Verify OTP

  const isMatch = await bcrypt.compare(otp, user.otp || "");

  if (!isMatch) {
    return res
      .status(400)
      .json(new ApiError(400, "Invalid OTP. Please check it once"));
  }

  // 5. Success -
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.passwordOtpVerify = true;
  // Assuming you have an 'is_verified' field in model

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Email Verified Successfully"));
});

// Add this to your auth-controller.js file
export const resetPassword = asyncHandler(async (req, res) => {
  const { Email, newPassword } = req.body;

  const user = await User.findOne({ email: Email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  if (!user.passwordOtpVerify || user.otpExpiry < Date.now()) {
    return res
      .status(403)
      .json(
        new ApiError(403, "Account not verified via OTP. || OR || OTP Expired")
      );
  }

  user.Password = newPassword;
  user.passwordOtpVerify = false;
  user.otpExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password has been Reset successfully!"));
});

export const getUserInfo = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(404).json(new ApiError(404, "No User Found"));
  const userFound = await User.findById(user.userId).select("-Password");
  return res.status(200).json(new ApiResponse(200, userFound, "ok"));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const allowedFields = [
    "fullname",
    "phone_number",
    "dob",
    "gender",
    "preferred_language",
    "timezone",
    "displayName",
  ];

  const updates = {};

  const body = req.body || {};

  // Debug log to see what's being received
  console.log("Request body:", body);
  console.log("Request file:", req.file);

  for (const field of allowedFields) {
    // Check if field exists and has a valid value
    const value = body[field];
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "undefined"
    ) {
      // Trim string values to remove any extra whitespace
      updates[field] = typeof value === "string" ? value.trim() : value;
    }
  }

  // 🖼️ Image upload (optional)
  if (req.file?.path) {
    const uploadResult = await ImagekitFileUploader(req.file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Image upload failed");
    }

    updates.profilePic = uploadResult.url;
  }

  // Allow update even if only one field is changed
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-Password -otp -otpExpiry");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", updatedUser));
});

//Admin only APIs

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(
    "-Password -otpExpiry -otp -passwordOtpVerify "
  );
  return res.status(200).json(new ApiResponse(200, users, "ok!"));
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .json(new ApiError(404, "User not found", null, null));

  return res.status(200).json(new ApiResponse(200, user, "User found"));
});

export const updateUserStatusById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = UpdateUserStatusValidation.parse(req.body);
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  if (user.status === status) {
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Status is already " + status));
  }
  user.status = status;
  await user.save(); // 'user' is the updated document
  return res.status(200).json(new ApiResponse(200, user, "User updated"));
});

export const updateUserRoleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log(req.body);
  const { role } = UpdateUserRoleValidation.parse(req.body);
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  if (user.role === role) {
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Role is already " + role));
  }
  user.role = role;
  await user.save(); // 'user' is the updated document
  return res.status(200).json(new ApiResponse(200, user, "User updated"));
});

export const deleteUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, user, "User deleted"));
});

export const allocateCounsellor = asyncHandler(async (req, res, next) => {
  const { category } = req.body;
  if (!category) {
    return res.status(401).json(new ApiError(401, "category is required"));
  }

  const counsellors = await Counsellor.find();

  return res.status(200).json(new ApiResponse(200, counsellors));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.user?._id;

  if (!userId) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized: user not found"));
  }

  const appointments = await Appointment.find({ user_id: userId })
    .populate({
      path: "counsellor_id",
      select:
        "fullname email counselling_type specialties years_experience languages hourly_rate documents rating",
    })
    .sort({ scheduled_at: -1 }) // latest first
    .lean();

  // Always return array (frontend safe)
  if (!appointments || appointments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No appointments booked"));
  }

  const enrichedAppointments = appointments.map((apt) => ({
    _id: apt._id,
    scheduled_at: apt.scheduled_at,
    duration_minutes: apt.duration_minutes,
    session_type: apt.session_type,
    status: apt.status,
    price: apt.price,
    notes: apt.notes || "",
    payment_status: apt.payment_status,
    counsellor_approved: apt.counsellor_approved,
    reminderSent: apt.reminderSent,

    counsellor: apt.counsellor_id
      ? {
          id: apt.counsellor_id._id,
          fullname: apt.counsellor_id.fullname,
          email: apt.counsellor_id.email,
          counselling_type: apt.counsellor_id.counselling_type,
          specialties: apt.counsellor_id.specialties,
          experience: apt.counsellor_id.years_experience,
          languages: apt.counsellor_id.languages || [],
          rating: apt.counsellor_id.rating,
          profile_picture: apt.counsellor_id.documents?.profile_picture || null,
        }
      : null,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedAppointments, "Appointments fetched"));
});

export const getCurrentuser = asyncHandler(async (req, res) => {
  const userid = req.user.userId;

  if (!userid) {
    throw new ApiError(404, "User ID not found");
  }

  console.log("🔍 Looking for counsellor with user_id:", userid);

  // ✅ Use findOne to get a single counsellor document
  const counsellor = await User.findOne({ userid });

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  console.log("✅ Counsellor found:", {
    _id: counsellor._id.toString(),
    user_id: counsellor.user_id.toString(),
    fullname: counsellor.fullname,
    email: counsellor.email,
  });

  // ✅ CRITICAL: Return in proper format
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: counsellor._id,
        user_id: counsellor.user_id,
        fullname: counsellor.fullname,
        email: counsellor.email,
        // ... other fields
      },
      "Counsellor found successfully"
    )
  );
});
