import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { voterImportService } from "./voterService.js";

export const voterImportController = {

  importExcel: asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("No file uploaded", 400);
    console.log("req", req.file);
    const result = await voterImportService.importExcelData(req.file.path);
    return res.status(result.statusCode).json(result);
  }),

  getAllVoters: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await voterImportService.getAllVoter(page, limit);
    return res.status(result.statusCode).json(result);

  }),
};

