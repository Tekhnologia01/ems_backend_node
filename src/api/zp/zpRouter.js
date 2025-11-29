import express from "express";
import { ZPController } from "./zpController.js";

export const ZPRouter = (() => {
  const router = express.Router();
  router.get("/List", ZPController.getAllZP);

  return router;
})();
