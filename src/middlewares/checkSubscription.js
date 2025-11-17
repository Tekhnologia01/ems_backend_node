import { query } from "../../src/utils/database.js";
import { getEpochTime } from "../utils/epoch.js";
import { ResponseBuilder } from "../utils/response.js";
import { AppError } from "./appError.js";

export async function checkSubscription(req, res, next) {
  try {
    const userId = req.user?.user_id; // populated by checkJWT
    if (!userId) {
      throw new AppError("User not found or inactive.", 401);
    }

    // Fetch the latest user package
    const [userPackage] = await query(
      `SELECT up.user_package_id,
              up.trial_start_date,
              up.is_trial_active,
              p.package_id,
              p.package_name,
              p.package_type,
              p.duration_days,
              p.price
       FROM tbl_user_packages up
       INNER JOIN tbl_packages p ON up.package_id = p.package_id
       WHERE up.user_id = ?
       ORDER BY up.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!userPackage) {
      throw new AppError("No package assigned. Please subscribe.", 403);
    }

    // ---- Trial Package Logic ----
    if (userPackage.package_type === "TRIAL") {
      if (!userPackage.trial_start_date) {
        throw new AppError("Trial not started properly.", 403);
      }

      const trialStart = Number(userPackage.trial_start_date) * 1000;
      const trialDurationMs = userPackage.duration_days * 24 * 60 * 60 * 1000;
      const trialEnd = trialStart + trialDurationMs;

      const now = getEpochTime(); // assuming this returns current epoch in ms

      if (now > trialEnd || userPackage.is_trial_active === "0") {
        // Expire the trial in DB
        await query(
          `UPDATE tbl_user_packages 
           SET is_trial_active = 0, updated_at = ?, updated_by = ? 
           WHERE user_package_id = ?`,
          [now, userId, userPackage.user_package_id]
        );

        const badRequestResponse = ResponseBuilder.badRequest(
          "Trial is expired. Please subscribe to a package."
        );
        return res
          .status(badRequestResponse.statusCode)
          .json(badRequestResponse);
      }
    }

    // All good, proceed
    next();
  } catch (err) {
    // Handle known AppError
    if (err instanceof AppError) {
      return res.status(err.statusCode || 400).json({
        status: "error",
        message: err.message,
      });
    }

    // Unknown/unexpected error
    console.error("Subscription check error:", err);
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred during subscription check.",
    });
  }
}
