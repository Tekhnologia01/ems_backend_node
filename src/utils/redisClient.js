import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 10000; // 10 seconds between retries

let retryCount = 0;

const redisClient = createClient({
  username: process.env.REDIS_USER || "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    timeout: 10000,
    reconnectStrategy: () => {
      if (retryCount >= MAX_RETRIES) {
        console.error("Redis retry limit reached. Not reconnecting.");
        return new Error("Retry limit reached");
      }
      retryCount++;
      const delay = RETRY_DELAY_MS * retryCount;
      console.warn(
        `Redis reconnecting in ${
          delay / 1000
        }s (attempt ${retryCount}/${MAX_RETRIES})`
      );
      return delay;
    },
  },
});

redisClient.on("connect", () => {
  console.log("Redis client connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis client connected and ready.");
  retryCount = 0; // Reset retry counter on successful connection
});

redisClient.on("error", (err) => {
  console.error(" Redis Client Error:", err.message);
});

async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error(" Initial Redis connection failed:", err.message);
  }
}

// Call immediately to connect
await connectRedis();

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    console.log(" Gracefully shutting down Redis client...");
    await redisClient.quit();
    process.exit(0);
  } catch (err) {
    console.error(" Error during Redis shutdown:", err.message);
    process.exit(1);
  }
});

export { redisClient };
