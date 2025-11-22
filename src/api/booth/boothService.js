import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const boothService = {

  getBooths: async () => {
   
    const result = await query("CALL ems1.GetAllBooths()");

    const booths = result?.[0] || [];

    return ResponseBuilder.success(
      "Booth list fetched successfully",
      booths
    );
  },
};
