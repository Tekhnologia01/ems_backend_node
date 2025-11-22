import express from "express";
import { voterImportController } from "./voterController.js";

export const voterRouter = (() => {
  const router = express.Router();
  
  router.post("/addVoter", voterImportController.addVoter);

  router.get("/list", voterImportController.getAllVoters );

  return router;
})();
