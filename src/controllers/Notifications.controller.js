import { Counsellor } from "../models/Counsellor.models.js";
import { Notification } from "../models/Notifications.model.js";
import { User } from "../models/User.models.js";
import { sendRealtimeNotification } from "../realtime/sendRealtimeNotification.js";
import { createAndSendNotification } from "../services/Notification.service.js";

// ===============================================================
// 📣 Create Notification
// ===============================================================
export const createNotification = async (req, res) => {
  try {
    const { title, body, channel, type, meta } = req.body;

    const notification = await createAndSendNotification({
      userId: req.user.userId,
      title,
      body,
      channel,
      type,
      meta,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// ===============================================================
// 📥 Get Notifications
// ===============================================================
export const getNotifications = async (req, res) => {
  try {
    let targetId = req.user.userId;

    // ⭐ If counsellor → get counsellorId
    if (req.user.role === "counsellor") {
      const counsellor = await Counsellor.findOne({
        user_id: req.user.userId,
      });

      if (counsellor) {
        targetId = counsellor._id;
      }
    }
    const query = { userId: targetId };
    // Optional filtering
    if (req.query.type) {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });
    res.json({ result: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ===============================================================
// 📌 Get Notification by ID
// ===============================================================
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notification" });
  }
};

// ===============================================================
// ✅ Mark as Read
// ===============================================================
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// ===============================================================
// 🔄 Optional: Update Notification
// ===============================================================
export const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// ===============================================================
// ❌ Delete Notification
// ===============================================================
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// ===============================================================
// 🗑️ Clear All Notifications
// ===============================================================
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.userId });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

// ===============================================================
// 🧑‍💻 Admin: Send Notification to All Users
// ===============================================================
export const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { title, body, type = "system", meta = {} } = req.body;

    // 1. Fetch all users (excluding admin if needed)
    const users = await User.find({ role: "user" }).select("_id");

    // 2. Prepare notifications
    const notifications = users.map((u) => ({
      userId: u._id,
      title,
      body,
      type,
      channel: "in-app",
      meta,
    }));

    // 3. Save in DB (bulk insert)
    await Notification.insertMany(notifications);

    // 4. Emit real-time to online users
    users.forEach((u) => {
      sendRealtimeNotification(u._id, { title, body, type, meta });
    });

    res.json({
      success: true,
      sentTo: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================================
// 🧑‍💻 Admin: Send Notification to All Counsellors
// ===============================================================
export const sendNotificationToAllCounsellors = async (req, res) => {
  try {
    const { title, body, type = "system", meta = {} } = req.body;

    const counsellors = await User.find({ role: "counsellor" }).select("_id");

    const notifications = counsellors.map((c) => ({
      userId: c._id,
      title,
      body,
      type,
      channel: "in-app",
      meta,
    }));

    await Notification.insertMany(notifications);

    counsellors.forEach((c) => {
      sendRealtimeNotification(c._id, { title, body, type, meta });
    });

    res.json({
      success: true,
      sentTo: counsellors.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================================
// 🧑‍💻 Admin: Send Notification to ALL Users (users + counsellors)
// ===============================================================
export const sendNotificationToAll = async (req, res) => {
  try {
    const { title, body, type = "system", meta = {} } = req.body;

    // 1️⃣ Fetch all active users (users + counsellors)
    const users = await User.find({
      role: { $in: ["user", "counsellor"] },
    }).select("_id");

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // 2️⃣ Prepare notification documents
    const notifications = users.map((u) => ({
      userId: u._id,
      title,
      body,
      type,
      channel: "in-app",
      meta,
    }));

    // 3️⃣ Save notifications in bulk
    await Notification.insertMany(notifications);

    // 4️⃣ Emit realtime notifications (only online users will receive)
    users.forEach((u) => {
      sendRealtimeNotification(u._id.toString(), {
        title,
        body,
        type,
        meta,
      });
    });

    res.json({
      success: true,
      sentTo: users.length,
    });
  } catch (error) {
    console.error("Broadcast ALL Notification Error:", error);
    res.status(500).json({ message: error.message });
  }
};
