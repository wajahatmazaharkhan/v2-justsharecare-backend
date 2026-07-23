// =====================================================
// BACKEND SOCKET FIX - socket.controller.js
// =====================================================

import {
  setIO,
  addOnlineUser,
  getSocketIdByUser,
  removeOnlineUserBySocket,
  getOnlineUsers,
} from "./socketContext.js";

import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";

export const initSocket = (io) => {
  setIO(io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ===============================================================
    // ➕ Add User (bind userId to socket)
    // ===============================================================
    socket.on("addUser", async (userId) => {
      if (!userId || userId.toString().trim() === "") {
        console.error("Invalid userId received in addUser:", userId);
        return;
      }

      const normalizedUserId = userId.toString();

      // 🔐 Bind userId to socket (IMPORTANT)
      socket.userId = normalizedUserId;

      addOnlineUser(normalizedUserId, socket.id);

      try {
        await User.findByIdAndUpdate(normalizedUserId, {
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error(" Error updating lastSeen in addUser:", err);
      }

      socket.emit("getUsers", getOnlineUsers());
      io.emit("userOnline", normalizedUserId);

      console.log(
        ` User ${normalizedUserId} registered with socket ${socket.id}`
      );
    });

    // ===============================================================
    // 🚪 Join Conversation Room
    // ===============================================================
    socket.on("joinRoom", (conversationId) => {
      if (!conversationId || conversationId.trim() === "") {
        console.error(" Invalid conversationId in joinRoom:", conversationId);
        return;
      }

      socket.join(conversationId);
      console.log(`🚪 Socket ${socket.id} joined room: ${conversationId}`);
    });

    // ===============================================================
    // 📨 Send Message - COMPLETE FIX
    // ===============================================================
    socket.on("sendMessage", async (data) => {
      const {
        _id,
        conversationId,
        receiverId,
        text,
        emoji,
        attachments,
        createdAt,
      } = data || {};

      // 🔐 Sender ALWAYS comes from socket
      const senderId = socket.userId;

      console.log("📨 sendMessage received:", {
        _id,
        senderId,
        receiverId,
        conversationId,
        hasText: !!text,
        hasAttachments: !!(attachments && attachments.length),
      });

      // 🚨 If addUser was not called
      if (!senderId) {
        console.error(
          " senderId missing — addUser not called before sendMessage"
        );
        return;
      }

      if (!conversationId || !receiverId) {
        console.error(" Missing required fields in sendMessage:", {
          conversationId,
          senderId,
          receiverId,
        });
        return;
      }

      try {
        const normalizedReceiverId = receiverId.toString();
        console.log(
          "--------normalizedReceiverId------------",
          normalizedReceiverId
        );

        //  CRITICAL FIX: Check both User and Counsellor collections
        let receiverUserId = normalizedReceiverId;
        let isCounsellor = false;

        // First, check if this is a counsellor._id
        const counsellor =
          await Counsellor.findById(normalizedReceiverId).select("user_id");
        if (counsellor && counsellor.user_id) {
          receiverUserId = counsellor.user_id.toString();
          isCounsellor = true;
          console.log(
            `🔄 Receiver is counsellor._id (${normalizedReceiverId}), using user_id: ${receiverUserId}`
          );
        } else {
          // Not a counsellor, check if it's a valid user
          const user = await User.findById(normalizedReceiverId).select("_id");
          if (user) {
            receiverUserId = normalizedReceiverId;
            console.log(` Receiver is user._id: ${receiverUserId}`);
          } else {
            console.error(
              ` Receiver ${normalizedReceiverId} not found in User or Counsellor`
            );
            return;
          }
        }

        const receiverSocketId = getSocketIdByUser(receiverUserId);

        const messageData = {
          _id: _id || Date.now().toString(),
          conversationId,
          senderId,
          receiverId: receiverUserId, // Use the resolved user_id
          text: text || "",
          emoji: emoji || null,
          attachments: attachments || [],
          createdAt: createdAt || new Date().toISOString(),
        };

        console.log("📤 Delivering message:", {
          receiverUserId,
          receiverSocketId: receiverSocketId || "OFFLINE",
          isCounsellor,
          messageData,
        });

        // 📩 CRITICAL: Send to receiver's personal socket
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", messageData);
          console.log(
            ` Message delivered to receiver socket: ${receiverSocketId}`
          );
        } else {
          console.log(
            `⚠️ Receiver ${receiverUserId} not online (no socket found)`
          );
        }

        // 📢 ALSO broadcast to the room (for multi-device support)
        socket.to(conversationId).emit("receiveMessage", messageData);
        console.log(` Message broadcast to room: ${conversationId}`);
      } catch (err) {
        console.error(" sendMessage socket error:", err);
      }
    });

    // ===============================================================
    // 📞 VIDEO/AUDIO CALL HANDLING - NEW EVENTS
    // ===============================================================

    //  Call User (Initiate Call)
    socket.on("callUser", async (data) => {
      const { from, fromName, to, conversationId, callType, roomId } =
        data || {};

      console.log("📞 Call initiated:", {
        from,
        fromName,
        to,
        callType,
        roomId,
        conversationId,
      });

      if (!from || !to || !roomId || !callType) {
        console.error(" Missing required fields in callUser:", data);
        return;
      }

      try {
        const normalizedReceiverId = to.toString();

        //  CRITICAL FIX: Check if receiver is a counsellor._id and get user_id
        let receiverUserId = normalizedReceiverId;

        const counsellor =
          await Counsellor.findById(normalizedReceiverId).select("user_id");
        if (counsellor && counsellor.user_id) {
          receiverUserId = counsellor.user_id.toString();
          console.log(
            `🔄 Call receiver is counsellor._id (${normalizedReceiverId}), using user_id: ${receiverUserId}`
          );
        } else {
          // Check if it's a valid user
          const user = await User.findById(normalizedReceiverId).select("_id");
          if (user) {
            receiverUserId = normalizedReceiverId;
            console.log(` Call receiver is user._id: ${receiverUserId}`);
          } else {
            console.error(
              ` Call receiver ${normalizedReceiverId} not found in User or Counsellor`
            );
            socket.emit("callFailed", {
              reason: "Receiver not found",
              receiverId: normalizedReceiverId,
            });
            return;
          }
        }

        //  Get receiver's socket ID
        const receiverSocketId = getSocketIdByUser(receiverUserId);

        if (receiverSocketId) {
          //  CRITICAL: Send invitation with SAME roomId
          io.to(receiverSocketId).emit("incomingCall", {
            from: from,
            fromName: fromName,
            conversationId: conversationId,
            callType: callType,
            roomId: roomId, //  MUST include this!
          });

          console.log(" Call invitation sent to:", {
            receiver: receiverUserId,
            socketId: receiverSocketId,
            roomId: roomId,
          });
        } else {
          // Receiver is offline
          console.log("⚠️ Call receiver not online:", receiverUserId);

          // Notify caller that receiver is offline
          socket.emit("callFailed", {
            reason: "User is offline",
            receiverId: receiverUserId,
          });
        }
      } catch (err) {
        console.error(" Error in callUser:", err);
        socket.emit("callFailed", {
          reason: "Server error",
          error: err.message,
        });
      }
    });

    //  Reject Call
    socket.on("rejectCall", async (data) => {
      const { to, conversationId } = data || {};

      console.log("📞 Call rejected:", {
        rejectedBy: socket.userId,
        notifying: to,
        conversationId,
      });

      if (!to) {
        console.error(" Missing 'to' field in rejectCall");
        return;
      }

      try {
        const normalizedCallerId = to.toString();

        // Resolve caller's user_id if it's a counsellor._id
        let callerUserId = normalizedCallerId;

        const counsellor =
          await Counsellor.findById(normalizedCallerId).select("user_id");
        if (counsellor && counsellor.user_id) {
          callerUserId = counsellor.user_id.toString();
        }

        const callerSocketId = getSocketIdByUser(callerUserId);

        if (callerSocketId) {
          io.to(callerSocketId).emit("callRejected", {
            conversationId,
          });
          console.log(" Call rejection sent to caller:", callerUserId);
        } else {
          console.log("⚠️ Caller not online:", callerUserId);
        }
      } catch (err) {
        console.error(" Error in rejectCall:", err);
      }
    });

    //  Cancel Call (by caller)
    socket.on("cancelCall", async (data) => {
      const { to, conversationId } = data || {};

      console.log("📞 Call cancelled:", {
        cancelledBy: socket.userId,
        notifying: to,
        conversationId,
      });

      if (!to) {
        console.error(" Missing 'to' field in cancelCall");
        return;
      }

      try {
        const normalizedReceiverId = to.toString();

        // Resolve receiver's user_id if it's a counsellor._id
        let receiverUserId = normalizedReceiverId;

        const counsellor =
          await Counsellor.findById(normalizedReceiverId).select("user_id");
        if (counsellor && counsellor.user_id) {
          receiverUserId = counsellor.user_id.toString();
        }

        const receiverSocketId = getSocketIdByUser(receiverUserId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("callCancelled", {
            conversationId,
          });
          console.log(" Call cancellation sent to receiver:", receiverUserId);
        } else {
          console.log("⚠️ Receiver not online:", receiverUserId);
        }
      } catch (err) {
        console.error(" Error in cancelCall:", err);
      }
    });

    //  End Call
    socket.on("endCall", async (data) => {
      const { to, conversationId } = data || {};

      console.log("📞 Call ended:", {
        endedBy: socket.userId,
        notifying: to,
        conversationId,
      });

      if (!to) {
        console.error(" Missing 'to' field in endCall");
        return;
      }

      try {
        const normalizedOtherUserId = to.toString();

        // Resolve other user's user_id if it's a counsellor._id
        let otherUserId = normalizedOtherUserId;

        const counsellor = await Counsellor.findById(
          normalizedOtherUserId
        ).select("user_id");
        if (counsellor && counsellor.user_id) {
          otherUserId = counsellor.user_id.toString();
        }

        const otherUserSocketId = getSocketIdByUser(otherUserId);

        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit("callEnded", {
            conversationId,
          });
          console.log(" Call ended notification sent to:", otherUserId);
        }
      } catch (err) {
        console.error(" Error in endCall:", err);
      }
    });

    // ===============================================================
    // 🔔 Typing Indicators
    // ===============================================================
    socket.on("typing", (data) => {
      const { conversationId, userId } = data || {};
      if (conversationId) {
        socket.to(conversationId).emit("userTyping", { userId });
      }
    });

    socket.on("stopTyping", (data) => {
      const { conversationId, userId } = data || {};
      if (conversationId) {
        socket.to(conversationId).emit("userStoppedTyping", { userId });
      }
    });

    // ===============================================================
    // 🔴 Disconnect
    // ===============================================================
    socket.on("disconnect", async () => {
      console.log("🔴 User disconnected:", socket.id);

      try {
        const disconnectedUser = removeOnlineUserBySocket(socket.id);

        if (disconnectedUser) {
          try {
            await User.findByIdAndUpdate(disconnectedUser, {
              lastSeen: new Date(),
            });
          } catch (err) {
            console.error(" Error updating lastSeen on disconnect:", err);
          }

          io.emit("userOffline", disconnectedUser);
          console.log(` User ${disconnectedUser} disconnected successfully`);
        }
      } catch (error) {
        console.error(" Error handling disconnect:", error);
      }
    });
  });
};
