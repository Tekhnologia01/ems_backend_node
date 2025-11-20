
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// const accessSecret = process.env.JWT_ACCESS_SECRET || "Tekhnologia@9999";
// const refreshSecret = process.env.JWT_REFRESH_SECRET || "Tekhnologia@2222";

// /**
//  * VERIFY TOKEN
//  */
// export const verifyToken = (token) => {
//   // if (!token) {
//   //   throw new Error("TOKEN_MISSING");
//   // }
  
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     console.log("JWT Verify Error:", err.message);
//     throw new Error("INVALID_TOKEN");
//   }
// };

// /**
//  * GENERATE ACCESS TOKEN
//  */
// export const generateAccessToken = (payload) => {
//   return jwt.sign(payload, accessSecret, {
//     expiresIn: process.env.JWT_ACCESS_EXPIRY || "1d",
//   });
// };

// /**
//  * GENERATE REFRESH TOKEN
//  */
// export const generateRefreshToken = (payload) => {
//   return jwt.sign(payload, refreshSecret, {
//     expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
//   });
// };


import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, accessSecret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret);
};
