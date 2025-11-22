import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const wardService = {

  getWards: async () => {
   
    const result = await query("CALL ems1.GetAllWard()");

    const wards = result?.[0] || [];

    return ResponseBuilder.success(
      "Ward list fetched successfully",wards
    );
  },
};
