import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { voterImportService } from "./voterService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const voterImportController = {
  // addVoter: asyncHandler(async (req, res, next) => {
  //   const {
  //     v_serial_num,
  //     v_card_num,
  //     v_name,
  //     v_parent_name,
  //     v_house_num,
  //     v_age,
  //     v_gender,
  //     v_name_mar,
  //     v_parent_name_mar,
  //     v_gender_mar,
  //     b_name,
  //     b_name_mar,
  //     ward_num,
  //     ward_name,
  //     t_name,
  //     t_name_mar,
  //     t_type,
  //     t_sarpanch_name,
  //     ps_name,
  //     ps_name_mar,
  //     zp_name,
  //     zp_name_mar,
  //     details_json
  //   } = req.body;

  //   const created_by = req.admin_user?.admin_user_id;
  //   const created_at = getEpochTime();
  //   console.log("result", req.body);

  //   try {
  //     const result = await voterImportService.addVoter({
  //       v_serial_num,
  //       v_card_num,
  //       v_name,
  //       v_parent_name,
  //       v_house_num,
  //       v_age,
  //       v_gender,
  //       v_name_mar,
  //       v_parent_name_mar,
  //       v_gender_mar,
  //       created_by,
  //       created_at,
  //       b_name,
  //       b_name_mar,
  //       ward_num,
  //       ward_name,
  //       t_name,
  //       t_name_mar,
  //       t_type,
  //       t_sarpanch_name,
  //       ps_name,
  //       ps_name_mar,
  //       zp_name,
  //       zp_name_mar,
  //       details_json
  //     });
  //     return res.status(201).json(result);
  //   } catch (error) {
  //     next(error);
  //   }
  // }),

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
  }

  return res.status(201).json({
    status: 1,
    message: "All voters inserted successfully.",
    totalInserted: results.length,
    data: results
  });
}),

  getAllVoters: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await voterImportService.getAllVoter(page, limit);
    return res.status(result.statusCode).json(result);

  }),
};

