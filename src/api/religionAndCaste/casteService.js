import { query } from "../../utils/database.js";
// import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";
import { getEpochTime } from "../../utils/epoch.js";

export const religionAndCastService = {
// add religions 
   addReligion: async ({ r_name, r_name_mar, created_by }) => {
     const created_at = getEpochTime();
    const result = await query(`CALL ems1.AddReligion(?,?,?,?)`, [
      r_name,
      r_name_mar,
      created_by,
      created_at
    ]);
   
    const religionId = result?.[0]?.[0]?.religion_id;

    return ResponseBuilder.success("Religion added successfully", {
      religion_id: religionId,
    });
  },

//   Get all Religions
   getReligionList: async () => {
    const result = await query(`CALL ems1.GetAllReligion()`);

    return ResponseBuilder.success("Religion list fetched", result[0]);
  },

// Add Castes
addCaste: async ({ religion_id, c_name, c_name_mar, created_by }) => {
    const created_at = getEpochTime();
    const result = await query(`CALL ems1.AddCaste(?,?,?,?,?)`, [
      religion_id,
      c_name,
      c_name_mar,
      created_by,
      created_at
    ]);
    const row = result?.[0]?.[0];

    return ResponseBuilder.success("Caste added successfully", {row});
  },

    getCasteList: async () => {
    const result = await query(`CALL ems1.GetAllCaste()`);
    const data = result?.[0] || [];

    return ResponseBuilder.success("Caste list fetched",data);
  },


};
