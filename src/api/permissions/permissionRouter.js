import express from "express";
import {permissionController } from "./permissionController.js";
// import { validate } from "../../middlewares/validate.js";


export const permissionRouter = (() => {
  const router = express.Router();

  router.post("/add", permissionController.addPermission);

  router.get("/fetch", permissionController.fetchPermissions);

  return router;
})();
