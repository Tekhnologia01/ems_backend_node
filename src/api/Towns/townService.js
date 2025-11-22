import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const townsService = {

  getTowns: async () => {
   
    const result = await query("CALL ems1.GetAllTows()");

    const towns = result?.[0] || [];

    return ResponseBuilder.success(
      "Towns list fetched successfully",
      towns
    );
  },
};
