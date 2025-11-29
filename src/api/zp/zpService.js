import { query, childQuery } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const ZPService = {

  getZP: async () => {
    const result = await childQuery("CALL GetAllZP()");
    const zp = result?.[0] || [];
    return ResponseBuilder.success(
      "ZP list fetched successfully",
      zp
    );
  },
};
