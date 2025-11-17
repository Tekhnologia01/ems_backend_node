import express from "express";
import { userController } from "./userController.js";
// import { verifyAdminToken } from "../../middlewares/auth.js";

export const userRouter = (() => {
  const router = express.Router();

  // router.use(verifyAdminToken); // optional, if you protect this API
  router.post("/register", userController.register);

  return router;
})();
