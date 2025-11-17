import { AppError } from "../middlewares/appError.js";

export const isExceedingLimit = async (userId, incomingSize, query) => {
  const [user] = await query(
    `SELECT storage_used, storage_limit 
     FROM tbl_users 
     WHERE user_id = ?`,
    [userId]
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { storage_used, storage_limit } = user;

  // storage_limit stored in bytes
  const totalAfterUpload = Number(storage_used) + Number(incomingSize);

  if (totalAfterUpload > Number(storage_limit)) {
    return true;
  }

  return false;
};
