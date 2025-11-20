import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { query } from "../../utils/database.js";
import { encrypt } from "../../utils/encryption.js";
import { getEpochTime } from "../../utils/epoch.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

dotenv.config();

export const adminService = {
  login: async ({ identifier, password }) => {
    const createdAt = getEpochTime();

    const encryptedIdentifier = encrypt(identifier).encryptedData;

    const spQuery = "CALL AdminLogin(?);";
    const result = await query(spQuery, [encryptedIdentifier]);

    const admin = result?.[0]?.[0];

    if (!admin || !admin.admin_password) {
      throw new AppError("Invalid email/mobile or password", 400);
    }

    const passwordMatch = await bcrypt.compare(password, admin.admin_password);

    if (!passwordMatch) {
      throw new AppError("Invalid email/mobile or password", 400);
    }

    const sessionId = uuidv4();
    const accessToken = generateAccessToken({
      admin_id: admin.admin_user_id,
      admin_name: admin.admin_name,
      is_superadmin: admin.is_superadmin,
      session_id: sessionId,
    });

    const refreshToken = generateRefreshToken({
      admin_id: admin.admin_user_id,
      session_id: sessionId,
    });

    await query(
      `INSERT INTO tbl_admin_sessions 
        (admin_id, session_id, refresh_token, created_at)
       VALUES (?,?,?,?)`,
      [admin.admin_user_id, sessionId, refreshToken, createdAt]
    );

    return ResponseBuilder.success("Admin login successful", {
      db_name: admin.db_name,
      accessToken,
      // refreshToken,

    });
  },

  // Admin Registration
  register: async ({
    admin_name,
    admin_email,
    admin_mobile_no,
    admin_password,
    admin_address,
  }) => {
    const createdAt = getEpochTime();

    const hashedPassword = await bcrypt.hash(admin_password, 10);

    const encryName = encrypt(admin_name).encryptedData;
    const encryEmail = encrypt(admin_email).encryptedData;
    const encryAddress = encrypt(admin_address).encryptedData;
    const encryMobileNo = encrypt(admin_mobile_no).encryptedData;

    const spQuery = "CALL RegisterAdmin(?,?,?,?,?);";
    const result = await query(spQuery, [
      encryName,
      encryEmail,
      encryMobileNo,
      hashedPassword,
      encryAddress
    ]);

    const row = result?.[0]?.[0];

    if (!row || !row.admin_id) {
      throw new AppError(row?.message || "Admin registration failed", 400);
    }

    const admin_user_id = row.admin_id;

    // Create unique DB name
    const newDbName = `ems${admin_user_id}`;

    // CALL CreateAdminDatabase after registration
    await query("CALL CreateAdminDatabase(?);", [newDbName]);

    const [user] = await query(`SELECT admin_user_id FROM tbl_admin_user WHERE admin_user_id = ? LIMIT 1`,
      [admin_user_id]
    );
    if (!user) {
      throw new AppError("Admin User record not found after registration", 500);
    }

    const hasVaultPassword = !!result.has_vault_password;

    const sessionId = uuidv4();
    const accessToken = generateAccessToken({
      admin_user_id: user.admin_user_id,
      admin_name: user.user_name,
      admin_email: user.user_email,
      admin_address: user.user_address,
      session_id: sessionId,
      is_vault: hasVaultPassword,
    });

    const refreshToken = generateRefreshToken({
      admin_id: user.admin_user_id,
      session_id: sessionId,
    });

    await query(
      `INSERT INTO tbl_admin_sessions (admin_id, session_id, refresh_token, created_at) VALUES (?,?,?,?)`,
      [
        admin_user_id,
        sessionId,
        refreshToken,
        createdAt,
      ]
    );


    return ResponseBuilder.success("Admin registered successfully", {
      admin_id: admin_user_id,
      accessToken,
      // refreshToken,
    });
  },

  // Refresh Token
  refreshToken: async (refreshToken, updatedAt) => {
    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError("Refresh token expired", 401);
    }

    const [session] = await query(
      `SELECT * FROM tbl_admin_sessions 
       WHERE admin_id = ? AND session_id = ? AND refresh_token = ?`,
      [decoded.admin_id, decoded.session_id, refreshToken]
    );

    if (!session) throw new AppError("Session not found", 401);

    const [admin] = await query(
      `SELECT * FROM tbl_admin_user 
       WHERE admin_user_id = ? AND admin_status = 1`,
      [decoded.admin_id]
    );

    const newSessionId = uuidv4();
    const newRefresh = generateRefreshToken({
      admin_id: decoded.admin_id,
      session_id: newSessionId,
    });

    const newAccess = generateAccessToken({
      admin_name: admin.admin_name,
      admin_id: admin.admin_user_id,
      is_superadmin: admin.is_superadmin,
      session_id: newSessionId,
    });

    await query(
      `UPDATE tbl_admin_sessions 
       SET session_id=?, refresh_token=?, updated_at=? 
       WHERE admin_session_id=?`,
      [newSessionId, newRefresh, updatedAt, session.admin_session_id]
    );

    return ResponseBuilder.success("Token refreshed", {
      accessToken: newAccess,
      refreshToken: newRefresh,
    });
  },

  // Logout
  logout: async (admin_id, session_id, logoutAll) => {
    if (logoutAll) {
      await query(`DELETE FROM tbl_admin_sessions WHERE admin_id=?`, [
        admin_id,
      ]);
    } else {
      await query(
        `DELETE FROM tbl_admin_sessions 
         WHERE admin_id=? AND session_id=?`,
        [admin_id, session_id]
      );
    }

    return ResponseBuilder.success("Logout successful");
  },

};
