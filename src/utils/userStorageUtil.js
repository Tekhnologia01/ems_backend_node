import { query } from "./database.js";
export const getUserStorageUsed = async (userId) => {
  const result = await query(
    `SELECT storage_used FROM tbl_users WHERE user_id = ?`,
    [userId]
  );
  return result[0]?.storage_used || 0;
};

export const getUserStorageLimit = async (userId) => {
  const result = await query(
    `SELECT storage_limit FROM tbl_users WHERE user_id = ?`,
    [userId]
  );
  return result[0]?.storage_limit || 2147483648; // 2GB default
};

export const incrementUserStorageUsed = async (userId, bytes) => {
  await query(
    `UPDATE tbl_users SET storage_used = storage_used + ? WHERE user_id = ?`,
    [bytes, userId]
  );
};

export const decrementUserStorageUsed = async (userId, bytes) => {
  await query(
    `UPDATE tbl_users SET storage_used = GREATEST(storage_used - ?, 0) WHERE user_id = ?`,
    [bytes, userId]
  );
};
