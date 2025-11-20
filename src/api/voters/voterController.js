import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { voterImportService } from "./voterService.js";
import { getEpochTime } from "../../utils/epoch.js";


export const voterImportController = {
addVoter: asyncHandler(async (req, res, next) => {
    const {
      v_serial_num,
      v_card_num,
      v_name,
      v_parent_name,
      v_house_num,
      v_age,
      v_gender,
      v_name_mar,
      v_parent_name_mar,
      v_gender_mar,
      details_json
    } = req.body;

    const created_by = req.admin_user?.admin_user_id;
    const created_at = getEpochTime();

    try {
      const result = await voterImportService.addVoter({
        v_serial_num,
        v_card_num,
        v_name,
        v_parent_name,
        v_house_num,
        v_age,
        v_gender,
        v_name_mar,
        v_parent_name_mar,
        v_gender_mar,
        created_by,
        created_at,
        details_json
      });
    return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }),

  getAllVoters: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await voterImportService.getAllVoter(page, limit);
    return res.status(result.statusCode).json(result);

  }),
};

