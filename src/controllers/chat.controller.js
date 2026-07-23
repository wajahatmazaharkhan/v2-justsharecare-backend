import { Conversation } from "../models/conversastion.models.js";
import { Appointment } from "../models/Appointments.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Counsellor } from "../models/Counsellor.models.js";

export const createConversastion = asyncHandler(async (req, res) => {
  const senderId = req.user.userId.toString(); // This is user_id from token
  const { AppointmentId } = req.body;

  console.log('🔵 Creating conversation - senderId (user_id):', senderId);

  if (!AppointmentId) {
    throw new ApiError(400, "Appointment Id is required");
  }

  const appointment = await Appointment.findById(AppointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  console.log('📅 Appointment found:', {
    _id: appointment._id,
    user_id: appointment.user_id,
    counsellor_id: appointment.counsellor_id
  });

  /* ---------- Session Time Check ---------- */
  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(
    startTime.getTime() + appointment.duration_minutes * 60000
  );
  const now = new Date();

  if (now < startTime || now > endTime) {
    throw new ApiError(403, "Session is not active");
  }

  /* ---------- Get User and Counsellor IDs ---------- */
  const appointmentUserId = appointment.user_id.toString();

  // ✅ Fetch counsellor to get user_id
  const counsellor = await Counsellor
    .findById(appointment.counsellor_id)
    .select("user_id");

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  const counsellorUserId = counsellor.user_id.toString();

  console.log('👥 Checking permission:', {
    senderId,
    appointmentUserId,
    counsellorUserId,
    isUser: senderId === appointmentUserId,
    isCounsellor: senderId === counsellorUserId
  });

  /* ---------- Permission Check (using user_id) ---------- */
  if (senderId !== appointmentUserId && senderId !== counsellorUserId) {
    console.log("❌ Permission denied");
    throw new ApiError(403, "Not allowed - You are not part of this appointment");
  }

  console.log('✅ Permission granted');

  /* ---------- Members Array (uses domain _id: user._id and counsellor._id) ---------- */
  const members = [
    appointment.user_id,           // User._id
    appointment.counsellor_id,     // Counsellor._id
  ];

  console.log('👥 Members array (User._id, Counsellor._id):', members.map(m => m.toString()));

  /* ---------- Check Existing Conversation ---------- */
  let conversation = await Conversation.findOne({
    sessionId: AppointmentId,
    isGroup: false,
    members: { $all: members },
  });

  if (conversation) {
    console.log('✅ Existing conversation found:', conversation._id);
    return res
      .status(200)
      .json(new ApiResponse(200, conversation, "Conversation already exists"));
  }

  /* ---------- Create Conversation ---------- */
  conversation = await Conversation.create({
    members,
    sessionId: AppointmentId,
    isGroup: false,
    lastMessageAt: new Date(),
  });

  console.log('✅ New conversation created:', conversation._id);

  return res
    .status(201)
    .json(new ApiResponse(201, conversation, "Conversation created"));
});

export const getChat = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  console.log('📥 Fetching chats for user:', userId);

  // Find all conversations where user is a member
  const conversations = await Conversation.find({
    members: userId,
  })
    .populate("members", "userName Email profileImg fullName")
    .sort({ lastMessageAt: -1 });

  console.log('✅ Found conversations:', conversations.length);

  return res
    .status(200)
    .json(new ApiResponse(200, conversations, "Chats fetched successfully"));
});