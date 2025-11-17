
const notificationMessages = {
  LIKE: ({ userName }) =>
    `${userName} liked your photo.`,

  COMMENT: ({ userName }) =>
    `${userName} commented on your photo.`,

  REACTION: ({ userName }) =>
    `${userName} reacted on your photo.`,
};

export const getNotificationMessage = (type, params = {}) =>
  notificationMessages[type]?.(params) || "Unknown notification type.";
