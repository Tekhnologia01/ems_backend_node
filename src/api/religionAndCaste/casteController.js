import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { religionAndCastService } from "./casteService.js";


export const religionAndCasteController = {
    //  add Religions
addReligion: asyncHandler(async (req, res) => {
    const { r_name, r_name_mar, created_by } = req.body;

    if (!r_name || !r_name_mar) {
      throw new AppError("Religion name and Marathi name are required", 400);
    }

    const result = await religionAndCastService.addReligion({ r_name, r_name_mar, created_by });

    return res.status(result.statusCode).json(result);
  }),

//   Get all Religions
   religionsList: asyncHandler(async (req, res) => {
    const result = await religionAndCastService.getReligionList();
    return res.status(result.statusCode).json(result);
  }),

//   Add Castes
 addCaste: asyncHandler(async (req, res) => {
    const { religion_id, c_name, c_name_mar, created_by } = req.body;

    if (!religion_id || !c_name || !c_name_mar) {
      throw new AppError("religion_id, c_name and c_name_mar are required", 400);
    }

    const result = await religionAndCastService.addCaste({
      religion_id,
      c_name,
      c_name_mar,
      created_by,
    });

    return res.status(result.statusCode).json(result);
  }),

   CastList: asyncHandler(async (req, res) => {
    const result = await religionAndCastService.getCasteList();
    return res.status(result.statusCode).json(result);
  }),
 
};
