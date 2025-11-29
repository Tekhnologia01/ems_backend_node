import { query, childQuery } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const wardService = {

  getWards: async () => {
   
    const result = await childQuery("CALL GetAllWard()");

    const wards = result?.[0] || [];

    return ResponseBuilder.success(
      "Ward list fetched successfully",wards
    );
  },
};
