import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET || "Tekhnologia@9999";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "Tekhnologia@2222";

export function verifyToken(token) {
  try {
    return jwt.verify(token, accessSecret);
  } catch (error) {
    throw error;
  }
}

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, accessSecret,  
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "9hr",
    }
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, refreshSecret,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    }
  );
};


