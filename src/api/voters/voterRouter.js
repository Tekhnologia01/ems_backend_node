import express from "express";
import { voterImportController } from "./voterController.js";

export const voterRouter = (() => {
  const router = express.Router();
  
  router.post("/addVoter", voterImportController.addVoter);

  router.get("/list", voterImportController.getAllVoters );

  // router.put("/update-favour", voterImportController.updateFavour);
   router.put("/update-favour", voterImportController.updateBulkFavour);

  return router;
})();
