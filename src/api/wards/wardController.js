import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { wardService } from "./wardService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const wardController = {

  getAllWard: asyncHandler(async (req, res) => {
    const result = await wardService.getWards();

    return res.status(result.statusCode).json(result);
  }),
};
