import { Message } from "../models/message.models.js";
import { Appointment } from "../models/Appointments.model.js";
import { Conversation } from "../models/conversastion.models.js";
import { Counsellor } from "../models/Counsellor.models.js";
import { ImagekitFileUploader } from "../services/imagekit.services.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { encryptText, decryptText } from "../security/aes-encryption.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user.userId;
  const { conversationId, text, emoji } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  if (!text && !req.files?.length) {
    throw new ApiError(400, "Message text or attachment required");
  }

  // 1️⃣ Validate conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // 2️⃣ Check membership - FIXED to handle both User and Counsellor
  let isMember = false;

  // Check if senderId is directly in members (for regular users)
  if (conversation.members.some((id) => id.equals(senderId))) {
    isMember = true;
    console.log('✅ User found in members (direct match)');
  } else {
    // Check if senderId is a counsellor's user_id
    const counsellor = await Counsellor.findOne({ user_id: senderId }).select('_id');
    if (counsellor && conversation.members.some((id) => id.equals(counsellor._id))) {
      isMember = true;
      console.log('✅ Counsellor found in members (via user_id lookup)');
    }
  }

  if (!isMember) {
    throw new ApiError(403, "You are not allowed to send message");
  }

  // 3️⃣ Validate appointment session
  const appointment = await Appointment.findById(conversation.sessionId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(
    startTime.getTime() + appointment.duration_minutes * 60000
  );

  const now = new Date();
  if (now < startTime || now > endTime) {
    throw new ApiError(403, "Chat session has expired");
  }

  // 4️⃣ Upload attachments (ImageKit)
  let attachments = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) => ImagekitFileUploader(file.path))
    );

    attachments = uploads
      .filter(Boolean)
      .map((file) => file.url || file.secure_url);
  }

  // 5️⃣ Encrypt message text
  let encryptedText = null;
  let key = null;

  if (text) {
    const cipher = await encryptText(text);
    encryptedText = cipher.encryptedHex;
    key = cipher.key;
  }

  // 6️⃣ Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text: encryptedText,
    key,
    emoji,
    attachments,
  });

  // 7️⃣ Update conversation activity
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: new Date(),
  });

  // 8️⃣ Return decrypted message for immediate display
  const messageResponse = {
    _id: message._id,
    conversation: message.conversation,
    sender: message.sender,
    text: text, // Return original text (decrypted) for frontend
    attachments: message.attachments,
    emoji: message.emoji,
    createdAt: message.createdAt,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, messageResponse, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { conversationId } = req.params;

  console.log("📥 Getting messages - userId:", userId, "conversationId:", conversationId);

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  console.log(
    "📋 Conversation members:",
    conversation.members.map((m) => m.toString())
  );

  // =====================================================
  // ✅ MEMBERSHIP CHECK (User OR Counsellor)
  // =====================================================
  let isMember = false;

  // Direct user match
  if (conversation.members.some((id) => id.equals(userId))) {
    console.log("✅ User found in members");
    isMember = true;
  } else {
    // Check if user is counsellor
    const counsellor = await Counsellor.findOne({ user_id: userId }).select("_id");

    if (counsellor) {
      console.log(
        "🔍 Found counsellor:",
        counsellor._id.toString()
      );

      if (conversation.members.some((id) => id.equals(counsellor._id))) {
        console.log("✅ Counsellor found in members");
        isMember = true;
      }
    }
  }

  if (!isMember) {
    console.log("❌ Not allowed to view messages");
    throw new ApiError(403, "You are not allowed to view messages");
  }

  // =====================================================
  // ✅ FETCH MESSAGES
  // =====================================================
  const messages = await Message.find({
    conversation: conversationId,
  }).sort({ createdAt: 1 });

  // =====================================================
  // ✅ DECRYPT MESSAGES SAFELY
  // =====================================================
  const decryptedMessages = await Promise.all(
    messages.map(async (msg) => {
      let finalText = null;

      console.log("🧪 Message Debug:", {
        id: msg._id,
        hasText: !!msg.text,
        hasKey: !!msg.key,
      });

      // Case 1 → Encrypted message
      if (msg.text && msg.key) {
        try {
          finalText = await decryptText(msg.key, msg.text);
        } catch (error) {
          console.error("❌ Decryption failed:", msg._id, error);
          finalText = "[decryption failed]";
        }
      }

      // Case 2 → Plain text message (fallback)
      else if (msg.text) {
        finalText = msg.text;
      }

      return {
        _id: msg._id,
        conversation: msg.conversation,
        sender: msg.sender,
        text: finalText,
        attachments: msg.attachments || [],
        emoji: msg.emoji || null,
        createdAt: msg.createdAt,
      };
    })
  );

  console.log("✅ Messages fetched:", decryptedMessages.length);

  return res
    .status(200)
    .json(
      new ApiResponse(200, decryptedMessages, "Messages fetched successfully")
    );
});
