import { childQuery, query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const boothService = {

  getBooths: async () => {
   
    const result = await childQuery("CALL GetAllBooths()");

    const booths = result?.[0] || [];

    return ResponseBuilder.success(
      "Booth list fetched successfully",
      booths
    );
  },
};
