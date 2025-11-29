import express from "express";
import { panchyatSamitiController } from "./psController.js";

export const panchayatSamitiRouter = (() => {
  const router = express.Router();
  router.get("/List", panchyatSamitiController.getAllPS);

  return router;
})();
