import xlsx from "xlsx";
import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const voterImportService = {
  addVoter: async (data) => {
    try {
      const detailsJsonString = JSON.stringify(data.details_json || []);

      const [rows] = await query(
        `CALL ems1.AddVoterWithDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          data.v_serial_num,
          data.v_card_num,
          data.v_name,
          data.v_parent_name,
          data.v_house_num,
          data.v_age,
          data.v_gender,
          data.v_name_mar,
          data.v_parent_name_mar,
          data.v_gender_mar,
          data.created_by,
          data.created_at,
          data.b_name,
          data.b_name_mar,
          data.ward_num,
          data.ward_name,
          data.t_name,
          data.t_name_mar,
          data.t_type,
          data.t_sarpanch_name,
          data.ps_name,
          data.ps_name_mar,
          data.zp_name,
          data.zp_name_mar,
          detailsJsonString,
        ]
      );

      return rows[0][0];
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

 
  updateBulkFavourStatus: async ({ records }) => {
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new AppError("Array of voter records required", 400);
    }

    const result = await query(`CALL ems1.updateFavourStatus(?)`, [
      JSON.stringify(records),
    ]);

    // Extract updated count from SP result
    const updatedCount = result?.[0]?.[0]?.updated_count || 0;

    if (updatedCount === 0) {
      throw new AppError("No records updated", 404);
    }

    return ResponseBuilder.success(`voter favour status updated successfully`, {
      updated: updatedCount,
    });
  },

  // update vote status
  updateBulkVoteStatus: async ({ records }) => {
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new AppError("Array of voter records required", 400);
    }

    const result = await query(`CALL ems1.updateBulkVoteStatus(?)`, [
      JSON.stringify(records),
    ]);

    // Get updated count returned from stored procedure
    const updatedCount = result?.[0]?.[0]?.updated_count || 0;

    if (updatedCount === 0) {
      throw new AppError("No records updated", 404);
    }

    return ResponseBuilder.success(
      `${updatedCount} voter vote status updated successfully`,
      { updated: updatedCount }
    );
  },
};
