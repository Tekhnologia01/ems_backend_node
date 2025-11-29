import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { panchayatSamitiService } from "./psService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const panchyatSamitiController = {

  getAllPS: asyncHandler(async (req, res) => {
    const result = await panchayatSamitiService.getPS();
    return res.status(result.statusCode).json(result);
  }),
  
};
