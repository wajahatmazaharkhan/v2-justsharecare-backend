// ===============================================================
// 🔌 Socket Context (IO + Online Users)
// ===============================================================

let io = null;
const onlineUsers = new Map();

// ===============================================================
// ⚡ IO Getter / Setter
// ===============================================================
export const setIO = (ioInstance) => {
  io = ioInstance;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

// ===============================================================
// 👥 Online Users Helpers
// ===============================================================
export const addOnlineUser = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

export const getSocketIdByUser = (userId) => {
  return onlineUsers.get(userId.toString());
};

export const removeOnlineUserBySocket = (socketId) => {
  let disconnectedUser = null;

  for (const [userId, sockId] of onlineUsers.entries()) {
    if (sockId === socketId) {
      disconnectedUser = userId;
      onlineUsers.delete(userId);
      break;
    }
  }

  return disconnectedUser;
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
