import rateLimit from "express-rate-limit";

// Define API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 999, 
  message: { message: "Too many requests from this IP, please try again later." },
  headers: true,
});
