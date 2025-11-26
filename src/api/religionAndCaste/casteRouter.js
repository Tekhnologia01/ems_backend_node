import express from "express";
import { religionAndCasteController } from "./casteController.js";

export const religionAndCasteRouter = (() => {
  const router = express.Router();
//   Religions Routes
 router.post("/addReligion", religionAndCasteController.addReligion);
 router.get("/religionsList", religionAndCasteController.religionsList);

//  Caste Routes
router.post("/addCast", religionAndCasteController.addCaste)
router.get("/castList", religionAndCasteController.CastList)
  return router;
})();
