import bcrypt from "bcrypt";
import { query } from "../../utils/database.js";
import { getEpochTime } from "../../utils/epoch.js";
import { ResponseBuilder } from "../../utils/response.js";
import { AppError } from "../../middlewares/appError.js";

export const userService = {
  register: async ({
    role_id,
    user_name,
    user_email,
    address,
    user_mobile_no,
    user_password,
    db_name,
    created_by,
  }) => {
    try {
      if (!db_name) {
        throw new AppError("Admin database not provided", 400);
      }

      const created_at = getEpochTime();
      const hashedPassword = await bcrypt.hash(user_password, 10);

      const spQuery = "CALL Register(?, ?, ?, ?, ?, ?, ?)";
      const result = await query(
        spQuery,
        [
          role_id,
          user_name,
          user_email,
          address,
          user_mobile_no,
          hashedPassword,
          created_at,
        ],
        db_name // use admin's DB
      );

      const row = result?.[0]?.[0];

      if (!row) {
        throw new AppError("No response from procedure", 500);
      }

      if (!row.user_id) {
        return ResponseBuilder.fail(row.message || "User registration failed");
      }

      return ResponseBuilder.success("User registered successfully", {
        user_id: row.user_id,
        message: row.message,
        db_name,
      });
    } catch (error) {
      console.error("userService.register error:", error);
      throw new AppError(error.message || "User registration failed", 500);
    }
  },
};
