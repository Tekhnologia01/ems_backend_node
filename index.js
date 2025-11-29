import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { pool } from "./src/initializers/dbConnection.js";
import masterRouter from "./src/router/v1/masterRouter.js";
import { apiLimiter } from "./src/middlewares/rateLimiter.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { zodErrorHandler } from "./src/middlewares/zodErrorHandler.js";
import { encrypt, decrypt } from "./src/utils/encryption.js";
// import "./src/config/passport.js";

// -------------------- Load env --------------------
dotenv.config();

// -------------------- Initialize app --------------------
const app = express();

// -------------------- Middleware: core --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://192.168.1.6:5173",
  "http://192.168.1.15:5173",
  "http://192.168.29.43:5173",
  "http://192.168.1.20:5173",
  "http://192.168.29.113:5173",
  "http://192.168.1.7:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.set("trust proxy", 1);

// -------------------- DB Connection Test --------------------
(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log("Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  }
})();

// -------------------- HTTP + Socket.IO --------------------
const server = http.createServer(app);

// -------------------- Routes --------------------
app.use("/api/v1", apiLimiter, masterRouter);
app.use("/api/v1", masterRouter);

// zod error handling
app.use(zodErrorHandler);

// controller error handling
app.use(errorHandler);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome, to EMS ZP!");
});


// -------------------- Error Handlers --------------------
app.use(zodErrorHandler);
app.use(errorHandler);

// check sample encrypted and decrypted data
// const sample = decrypt(
//   "33c570b2bfdfd6db3d9fe8f2a4962124",
//   process.env.STATIC_KEY
// );
// const sample = encrypt("mumbai").encryptedData;
// console.log(sample);

// const sample = "a0f71e357f8f86b5e623e7380c842799de48946ea447231e574cf0725de65d45";
// const sample = "8f64a53fbc980e63318c8f7aa754e27c16578001712f1dd6521aec990329ad30cb3499d2d77440409e491f25e0380cdc128cf741ea32a5c1be494d12222ad4cf2e023c7bb22823a7fe5c143d584e078b38dbc7f6247a03fbb1c91e209f71e417";
// console.log(encrypt(sample).encryptedData)
// console.log(decrypt(sample, process.env.STATIC_KEY));


// -------------------- Start Server --------------------
const PORT = process.env.APP_PORT || 7005;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Allowed origins:`, allowedOrigins);
});
