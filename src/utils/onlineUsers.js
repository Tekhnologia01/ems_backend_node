// Shared global Map to track online users across the application
export const onlineUsers = new Map();

// Helper functions
export const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
  console.log(`User ${userId} online. Sockets:`, Array.from(onlineUsers.get(userId)));
};

export const removeOnlineUser = (userId, socketId) => {
  const userSockets = onlineUsers.get(userId);
  if (userSockets) {
    userSockets.delete(socketId);
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
    }
    console.log(`User ${userId} socket removed. Remaining:`, userSockets?.size || 0);
  }
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

export const getUserSockets = (userId) => {
  return onlineUsers.get(userId) || new Set();
};