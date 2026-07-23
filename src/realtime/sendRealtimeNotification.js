import { getIO, getSocketIdByUser } from "../socket/socketContext.js";

// ===============================================================
// 📣 Send Realtime Notification
// ===============================================================
export const sendRealtimeNotification = (userId, notification) => {
  const io = getIO();
  const socketId = getSocketIdByUser(userId);

  if (socketId) {
    io.to(socketId).emit("getNotification", notification);
  }
};
