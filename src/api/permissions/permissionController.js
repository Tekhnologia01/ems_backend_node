import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { permissionService } from "./permissionService.js";
import { getEpochTime } from "../../utils/epoch.js";

export const permissionController = {
  // add permission
   addPermission: asyncHandler(async (req, res) => {
    const { per_name, id_default } = req.body;
    const created_by = req.user?.user_id;
    const created_at = getEpochTime();

    // Input validation
    if (!per_name || !id_default) {
      throw new AppError("Missing required fields: per_name, id_default", 400);
    }

    // Call service layer
    const result = await permissionService.addPermission({
      per_name,
      id_default,
      created_by,
      created_at,
    });

    //  Send response
    return res.status(result.statusCode).json(result);
  }),

   //  Fetch permissions
  fetchPermissions: asyncHandler(async (req, res) => {
    const result = await permissionService.fetchPermissions();
    return res.status(result.statusCode).json(result);
  }),

}
