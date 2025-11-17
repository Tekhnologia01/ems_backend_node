// src/api/auth/authUtils.js

export const generateRandomToken = () => {
  return Math.random().toString(36).substring(2);
};
