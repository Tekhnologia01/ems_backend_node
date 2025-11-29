import express from "express";
import { votersGroupController } from "./votersGroupController.js";

export const votersGroupRouter = (() => {
  const router = express.Router();

    router.post("/add-group", votersGroupController.addVGroup)
    router.get("/", votersGroupController.getVoterGroups)

  return router;
})();
