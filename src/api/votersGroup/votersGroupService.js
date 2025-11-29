import { query, childQuery } from "../../utils/database.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";
import { getEpochTime } from "../../utils/epoch.js";


export const votersGroupService = {

addVotersGroup: async ({ v_g_name, v_g_name_mar, group_head_name, members, created_by}) => {
    const created_at = getEpochTime();
     const membersJson = JSON.stringify(members);
    const result = await childQuery(`CALL AddVoterGroupWithMembers(?,?,?,?,?,?)`, [
       v_g_name, 
       v_g_name_mar, 
       group_head_name, 
       membersJson,
       created_by,  
       created_at
    ]);
    const row = result?.[0]?.[0];

    return ResponseBuilder.success("Voters Group Added Successfully", { row });
  },

   getVotersGroupWithMembers: async () => {
    const result = await childQuery(`CALL GetVoterGroupsWithMembers()`);

    // MySQL procedures return nested arrays → clean response
    const groups = result?.[0] || [];

    return ResponseBuilder.success(
      "Voter Groups fetched successfully",
      groups
    );
  },

};
