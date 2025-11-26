import express from "express";
import { checkJWT } from "../../middlewares/checkJwt.js";
import { authRouter } from "../../api/auth/authRouter.js";
import { permissionRouter } from "../../api/permissions/permissionRouter.js";
import { userRouter } from "../../api/user/userRouter.js";
import { adminRouter } from "../../api/adminAuth/adminAuthRouter.js";
import { voterRouter } from "../../api/voters/voterRouter.js"
import { boothRouter } from "../../api/booth/boothRouter.js";
import { wardRouter } from "../../api/wards/wardRouter.js";
import { townsRouter } from "../../api/Towns/townRouter.js";
import { religionAndCasteRouter } from "../../api/religionAndCaste/casteRouter.js";


const router = express.Router();
router.use("/adminAuth", adminRouter)  // Admin register/login
router.use("/auth", authRouter);   // User register/login
router.use(checkJWT);

router.use("/user", userRouter);
router.use("/permissions", permissionRouter)
router.use("/voter", voterRouter)
router.use("/booth", boothRouter)
router.use("/wards", wardRouter)
router.use("/towns", townsRouter)
router.use("/religionAndCaste", religionAndCasteRouter)

export default router;
