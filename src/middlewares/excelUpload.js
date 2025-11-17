// src/middlewares/excelUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed Excel file types
const allowedExcelTypes = [".xlsx", ".xls", ".csv"];

// Ensure upload directory exists
const uploadDir = "uploads/excel";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowed = allowedExcelTypes.includes(ext);
  if (!isAllowed) {
    return cb(new Error("Only Excel files (.xlsx, .xls, .csv) are allowed"), false);
  }
  cb(null, true);
};

// Export uploadExcel
export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});
