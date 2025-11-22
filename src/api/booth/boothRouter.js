import express from "express";
import { boothController } from "./boothController.js";

export const boothRouter = (() => {
   const router = express.Router();

  router.get("/boothList", boothController.getAllBooth);

  return router;
})();
