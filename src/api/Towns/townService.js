import { query, childQuery } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const townsService = {

  getTowns: async () => {
   
    const result = await childQuery("CALL GetAllTows()");

    const towns = result?.[0] || [];

    return ResponseBuilder.success(
      "Towns list fetched successfully",
      towns
    );
  },
};
