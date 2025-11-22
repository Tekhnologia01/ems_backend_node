import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { townsService } from "./townService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const townsController = {

  getAllTowns: asyncHandler(async (req, res) => {
    const result = await townsService.getTowns();

    return res.status(result.statusCode).json(result);
  }),
};
