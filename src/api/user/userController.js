import { userService } from "./userService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";

export const userController = {
  register: asyncHandler(async (req, res) => {
    const {
      role_id,
      user_name,
      user_email,
      address,
      user_mobile_no,
      user_password,
    } = req.body;

    // The admin DB name comes from the logged-in admin token or request
    const db_name = req.admin?.db_name || req.body.db_name;

    if (
      !role_id ||
      !user_name ||
      !user_email ||
      !address ||
      !user_mobile_no ||
      !user_password ||
      !db_name
    ) {
      throw new AppError(
        "All fields required: role_id, name, email, address, mobile_no, password, db_name",
        400
      );
    }

    const created_by = req.admin?.admin_id || null;

    const result = await userService.register({
      role_id,
      user_name,
      user_email,
      address,
      user_mobile_no,
      user_password,
      db_name,
      created_by,
    });

    return res.status(result.statusCode).json(result);
  }),
};
