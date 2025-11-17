import { query } from "../utils/database.js";
import { AppError } from "./appError.js";

export const checkUserExists = async (req, res, next) => {
  const userId = req.user.user_id;
  if (!userId) {
    throw new AppError("Missing user_id parameter", 400);
  }
  const sql = `SELECT user_id, user_name, user_email, user_mobile_no, user_photo_path, user_prof_photo
      FROM tbl_users
      WHERE user_id = ? AND user_status = 1
      LIMIT 1`;

  const result = await query(sql, [userId]);

  if (result.length === 0) {
    throw new AppError(
      "User not found in the system or the account is inactive.",
      404
    );
  }
  next();
};
