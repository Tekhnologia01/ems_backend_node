
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { votersGroupService } from "./votersGroupService.js";


export const votersGroupController = {

addVGroup: asyncHandler(async (req, res) => {
    const { v_g_name, v_g_name_mar, group_head_name, members , created_by } = req.body;

    if (!v_g_name || !v_g_name_mar || !group_head_name || !members) {
      throw new AppError("group name, group name marathi, group head and group members", 400);
    }
    const result = await votersGroupService.addVotersGroup({ 
      v_g_name, 
      v_g_name_mar, 
      group_head_name, 
      members, 
      created_by 
    });

    return res.status(result.statusCode).json(result);
  }),

   getVoterGroups: asyncHandler(async (req, res) => {

    const response = await votersGroupService.getVotersGroupWithMembers();

    return res.status(response.statusCode).json(response);
  }),


  };