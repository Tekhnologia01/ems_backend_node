import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { voterImportService } from "./voterService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const voterImportController = {
  addVoter: asyncHandler(async (req, res, next) => {
    const records = req.body; // Expect array

    if (!Array.isArray(records) || records.length === 0) {
      throw new AppError("Please provide voter records array", 400);
    }

    const created_by = req.admin_user?.admin_user_id;
    const created_at = getEpochTime();

    const results = [];

    for (const record of records) {
      record.created_by = created_by;
      record.created_at = created_at;

      const result = await voterImportService.addVoter(record);
      results.push(result);
      console.log("result", result);
      console.log("results", results);
    }

    return res.status(201).json({
      status: 1,
      message: "All voters inserted successfully.",
      totalInserted: results.length,
      data: results,
    });
  }),

  getAllVoters: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await voterImportService.getAllVoter(page, limit);
    return res.status(result.statusCode).json(result);
  }),

  // update fovour status
  updateBulkFavour: asyncHandler(async (req, res) => {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new AppError("Please send records array", 400);
    }

    const result = await voterImportService.updateBulkFavourStatus({ records });

    return res.status(result.statusCode).json(result);
  }),

  // update vote status
  updateVoteStatus: asyncHandler(async (req, res) => {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new AppError("Please send records array", 400);
    }

    const result = await voterImportService.updateBulkVoteStatus({ records });

    return res.status(result.statusCode).json(result);
  }),

  // update caste 
  updateCaste: asyncHandler(async (req, res) => {
  const { records } = req.body || {};

  if (!records || !Array.isArray(records) || records.length === 0) {
    throw new AppError("records array is required", 400);
  }

  const result = await voterImportService.updateCaste({ records });

  return res.status(result.statusCode).json(result);
}),
};
