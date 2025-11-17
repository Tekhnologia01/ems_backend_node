import path from "path";
import { AppError } from "./appError.js";
// Allowed image/video extensions
const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".mp4",
  ".mov",
  ".webm",
];

export const validateMediaUpload = (req, res, next) => {
  const mediaList = req.body.mediaList;

  if (!Array.isArray(mediaList) || mediaList.length === 0) {
    throw new AppError("No media items provided.", 400);
  }

  for (const item of mediaList) {
    const { mediaName } = item;
    if (!mediaName) {
      throw new AppError("Media name missing.", 400);
    }

    const ext = path.extname(mediaName).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported media type: ${mediaName}`,
      });
    }
  }
  next();
};
