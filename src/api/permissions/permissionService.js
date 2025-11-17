import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const permissionService = {

addPermission: async ({ per_name, id_default, created_by, created_at }) => {
    try {
      const [rows] = await query("CALL AddPermission(?, ?, ?, ?)", [
        per_name,
        id_default,
        created_by,
        created_at,
      ]);

      if (!rows || rows.length === 0) {
        throw new AppError("Failed to add permission. No data returned.", 500);
      }

      return ResponseBuilder.created("Permission added successfully", rows[0]);

    } catch (error) {
      if (error.sqlState === "45000") {
        // Custom SIGNAL thrown from MySQL stored procedure (e.g., duplicate permission)
        throw new AppError(error.sqlMessage, 400);
      }

      console.error(" MySQL Error while adding permission:", {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sql: error.sql,
      });
      throw new AppError("Database error while adding permission", 500, error.message);
    }
  },

fetchPermissions: async () => {
    const result = await query("CALL FetchPermissions()");
    const data = result[0] || {};
    return ResponseBuilder.success("User media fetched successfully", data);
  },

};
