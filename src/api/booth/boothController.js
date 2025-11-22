import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { boothService } from "./boothService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const boothController = {

  getAllBooth: asyncHandler(async (req, res) => {
    const result = await boothService.getBooths();

    return res.status(result.statusCode).json(result);
  }),
};
