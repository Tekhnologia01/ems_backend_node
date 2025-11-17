import xlsx from "xlsx";
import { query } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";

export const voterImportService = {
  importExcelData: async (filePath) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      console.log(jsonData);
      
      if (!jsonData.length) throw new AppError("Excel file is empty", 400);

      // Format JSON according to DB column names
      const formattedData = jsonData.map((row) => ({
        v_serial_num: row["v_serial_num"],
        v_card_num: row["v_card_num"],
        v_name: row["v_name"],
        v_parent_name: row["v_parent_name"],
        v_house_num: row["v_house_num"],
        v_age: row["v_age"],
        v_gender: row["v_gender"],
        v_name_mar: row["v_name_mar"],
        v_parent_name_mar: row["v_parent_name_mar"],
        t_name: row["t_name"],
        v_taluka: row["v_taluka"],
        v_dist: row["v_dist"],
        v_state: row["v_state"],
        c_name: row["c_name"]
      }));

      await query("CALL ems1.ImportFullVoterHierarchy(?)", [JSON.stringify(formattedData)]);

      return ResponseBuilder.success("Voter data imported successfully", {
        total_records: formattedData.length,
      });
    } catch (error) {
      throw new AppError(error.message || "Error importing Excel data", 500);
    }
  },

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
