import express from "express";
import { townsController } from "./townController.js";

export const townsRouter = (() => {
  const router = express.Router();
  router.get("/townsList", townsController.getAllTowns);

  return router;
})();
