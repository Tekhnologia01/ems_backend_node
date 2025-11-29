import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { ZPService } from "./zpService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const ZPController = {

  getAllZP: asyncHandler(async (req, res) => {
    const result = await ZPService.getZP();
    return res.status(result.statusCode).json(result);
  }),
  
};
