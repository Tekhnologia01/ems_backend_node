import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { BlobServiceClient } from "@azure/storage-blob";
import { getEpochTime } from "../utils/epoch.js"; // Adjust path
import mime from "mime-types"; // For MIME type resolution
import { AppError } from "./appError.js";
import sharp from "sharp";

dotenv.config();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Multer configuration with memoryStorage
export const upload = multer({
  storage: multer.memoryStorage(),
  // limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("Invalid file name."));
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    // Validate file fields
    if (
      ["mediaFile", "circlePhoto", "userPhoto", "excelFile"].includes(
        file.fieldname
      )
    ) {
      if (
        file.fieldname === "mediaFile" ||
        file.fieldname === "circlePhoto" ||
        file.fieldname === "userPhoto"
      ) {
        const allowedExt = /\.(jpeg|jpg|png|WEBP|AVIF)$/i;
        const mimeOk = /image\/(jpeg|jpg|png|WEBP|AVIF)/i.test(mimeType);
        if (allowedExt.test(ext) && mimeOk) {
          return cb(null, true);
        } else {
          return cb(
            new Error(
              "Only JPEG, JPG, WEBP ,AVIF and PNG files are allowed for photos."
            )
          );
        }
      }

      if (file.fieldname === "excelFile") {
        const allowedExt = /\.(xls|xlsx)$/i;
        const mimeOk =
          mimeType ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          mimeType === "application/vnd.ms-excel";
        if (allowedExt.test(ext) && mimeOk) {
          return cb(null, true);
        } else {
          return cb(
            new Error(
              "Only Excel files (.xls, .xlsx) are allowed for excelFile."
            )
          );
        }
      }
    } else {
      // Allow non-file fields (e.g., text fields) to prevent rejecting the request
      return cb(null, false); // Skip file but allow req.body parsing
    }
  },
});

export const multerErrorHandler = (err, req, res, next) => {
  console.log("multerErrorHandler - Error:", err);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: false,
        message: `File too large. Maximum size allowed is ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB.`,
      });
    }
  } else if (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
  next();
};

const getRandomNumber = () => Math.floor(1000 + Math.random() * 9000);

export const photoToAzureBlob = async (file, folder) => {
  try {
    const connStr = process.env.AZURE_CONNECTION_STRING;
    const containerName = process.env.USER_PHOTO_THUMBNAIL_CONTAINER;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: "container" });

    const epochTime = getEpochTime();
    const randomNum = getRandomNumber();

    const prefixMap = { userPhoto: "UP", circlePhoto: "GP" };
    const baseName = prefixMap[file.fieldname] || "File";

    const blobName = `${folder}/${baseName}_${randomNum}_${epochTime}.webp`;
    // const blobName = `${folder}/default_circle_photo.webp`;

    const thumbnailBuffer = await sharp(file.buffer)
      .resize({
        width: 300,
        height: 300,
        fit: "cover",
        withoutEnlargement: true,
      })
      .webp({
        quality: 75,
        smartSubsample: true,
        effort: 4,
        nearLossless: true,
      })
      .toBuffer();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(thumbnailBuffer, {
      blobHTTPHeaders: { blobContentType: "image/webp" },
    });

    return blockBlobClient.url;
  } catch (err) {
    console.error("Azure Blob Upload Error:", err);
    throw new AppError(
      "Failed to upload profile thumbnail to Azure Blob Storage."
    );
  }
};

export const mediaUploadToAzureBlob = async (
  fileOrBuffer,
  folder,
  fileName = null,
  mimeType = null,
  fieldname = null
) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_MEDIA_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      process.env.MEDIA_CONTAINER_NAME
    );
    await containerClient.createIfNotExists({ access: "container" });

    const isFileObj = typeof fileOrBuffer === "object" && fileOrBuffer.buffer;
    const buffer = isFileObj ? fileOrBuffer.buffer : fileOrBuffer;
    const mimeTypeResolved = isFileObj
      ? fileOrBuffer.mimetype
      : mimeType || "application/octet-stream";
    const field = isFileObj ? fileOrBuffer.fieldname : fieldname || "custom";

    const prefixMap = { folderImage: "FI", folderVideo: "FV", thumb: "thumb" };
    const prefix = prefixMap[field] || "FILE";
    const epoch = getEpochTime();
    const ext =
      path.extname(isFileObj ? fileOrBuffer.originalname : fileName || "") ||
      `.${mime.extension(mimeTypeResolved) || "bin"}`;

    const name = fileName ?? `${prefix}-${epoch}${ext}`;
    const blobName = `${folder}/${name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeTypeResolved },
    });

    return blockBlobClient.url;
  } catch (err) {
    console.error("Azure Blob Upload Error:", err);
    throw new Error("Failed to upload file to Azure Blob Storage.");
  }
};
