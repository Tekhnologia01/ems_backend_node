import express from "express";
import { verifyAdmin } from "../../middlewares/authmiddleware.js";
import { voterImportController } from "./voterController.js";
import { uploadExcel } from "../../middlewares/excelUpload.js";

export const voterRouter = (() => {
  const router = express.Router();

  router.post(
    "/import-excel",
    // verifyAdmin,
    uploadExcel.single("file"),
    voterImportController.importExcel
  );

    router.get("/list",
    // verifyAdminToken,
    voterImportController.getAllVoters
  );

  return router;
})();
