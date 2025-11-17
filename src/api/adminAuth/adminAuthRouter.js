import express from "express";
import { adminController } from "./adminAuthController.js";
// import { validate } from '../../middlewares/validate.js';


export const adminRouter = (() => {
  const router = express.Router();

  router.post("/login", adminController.login);
  router.post("/register",  adminController.adminRegister);
  router.post("/refresh-token", adminController.refreshToken);
//   router.post("/logout", validate(logoutSchema), adminController.logout);


  return router;
})();
