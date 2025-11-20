import xlsx from "xlsx";
import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const voterImportService = {
//  Add voters
  addVoter: async (data) => {
    try {
      const {
        v_serial_num,
        v_card_num,
        v_name,
        v_parent_name,
        v_house_num,
        v_age,
        v_gender,
        v_name_mar,
        v_parent_name_mar,
        v_gender_mar,
        created_by,
        created_at,
        details_json
      } = data;

      const detailsJsonString = JSON.stringify(details_json || []);

      const [rows] = await query(
        `CALL ems1.AddVoterWithDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          v_serial_num,
          v_card_num,
          v_name,
          v_parent_name,
          v_house_num,
          v_age,
          v_gender,
          v_name_mar,
          v_parent_name_mar,
          v_gender_mar,
          created_by,
          created_at,
          detailsJsonString
        ]
      );

      return rows[0];
    } catch (error) {
      console.error("Add Voter Service Error:", error);
      throw error;
    }
  },

  //Fetch all voters List
  getAllVoter: async (page, limit) => {
    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 10;

    try {
      const result = await query("CALL ems1.GetAllVoters(?, ?)", [page, limit]);

      const voterRows = result[0];
      const countRows = result[1];

      const total = countRows?.[0]?.total_records || 0;

      return ResponseBuilder.success("Voters fetched successfully", {
        voters: voterRows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      throw new AppError(error.message || "Error fetching voters", 500);
    }
  },
};
