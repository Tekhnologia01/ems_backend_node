import express from "express";
import { wardController } from "./wardController.js";

export const wardRouter = (() => {
   const router = express.Router();

  router.get("/wardList", wardController.getAllWard);

  return router;
})();
