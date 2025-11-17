import crypto from "node:crypto";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const algorithm = "aes-256-cbc";

// 32-byte demo key (64 hex characters)
const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// 16-byte demo IV (32 hex characters)
const staticIV = Buffer.from(process.env.STATIC_KEY, "hex");

export function encrypt(text) {
  if(!text){
    return null
  }
  const cipher = crypto.createCipheriv(algorithm, secretKey, staticIV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: staticIV.toString("hex"), // same IV used every time (for demo only!)
    encryptedData: encrypted,
  };
}

export function decrypt(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
