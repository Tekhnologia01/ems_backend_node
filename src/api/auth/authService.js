import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { query } from "../../utils/database.js";
import { getEpochTime } from "../../utils/epoch.js";
import { encrypt } from "../../utils/encryption.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

// Load environment variables
dotenv.config();

export const authService = {
  // Login User
  login: async ({ identifier, password, clientIsWeb }) => {
    const maxLogins = process.env.MAX_LOGINS;
    const userAgent = clientIsWeb ? "web" : "mobile";
    const encryIdentifier = encrypt(identifier).encryptedData;
    const createdAt = getEpochTime();
    const spQuery = "CALL Login(?);";
    const spResults = await query(spQuery, [encryIdentifier]);

    // Ensure we got user data
    if (!spResults[0][0] || spResults[0].length === 0) {
      throw new AppError("Invalid Email/Mobile Number or Password", 400);
    }

    const user = spResults[0][0];

    if (!user.user_password) {
      throw new AppError("Invalid Email/Mobile Number or Password", 400);
    }

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.user_password);

    if (!passwordMatch) {
      throw new AppError("Invalid Email/Mobile Number or Password", 400);
    }

    const existingSessions = await query(
      `SELECT * FROM tbl_user_sessions WHERE user_session_user_id = ?;`,
      [user.user_id]
    );

    if (existingSessions?.length >= +maxLogins) {
      // Delete the oldest session before inserting a new one
      await query(
        `DELETE FROM tbl_user_sessions 
        WHERE user_session_user_id = ? 
          AND updated_at IS NOT NULL
        ORDER BY updated_at ASC 
        LIMIT 1;`,
        [user.user_id]
      );
    }

    const [result] = await query(
      `
  SELECT EXISTS(
    SELECT 1 
    FROM tbl_access_passwords ap
    WHERE ap.access_pass_user_id = ?
  ) AS has_vault_password;
  `,
      [user.user_id]
    );

    const hasVaultPassword = !!result.has_vault_password;

    const sessionId = uuidv4();

    // Generate access token
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.email,
      session_id: sessionId,
      is_vault: hasVaultPassword,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      user_id: user.user_id,
      session_id: sessionId,
    });

    await query(
      `INSERT INTO tbl_user_sessions (user_session_user_id, user_session_session_id, user_session_agent, user_refresh_token, created_at) VALUES (?, ?, ?, ?, ?);`,
      [user.user_id, sessionId, userAgent, refreshToken, createdAt]
    );

    return ResponseBuilder.success("Login successful.", {
      accessToken,
      refreshToken,
    });
  },

  // Register User
  register: async ({
    role_id,
    name,
    email,
    address,
    mobileNo,
    password,
    createdAt,
    clientIsWeb,
  }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryName = encrypt(name).encryptedData;
    const encryEmail = encrypt(email).encryptedData;
    const encryAddress = encrypt(address).encryptedData;
    const encryMobileNo = encrypt(mobileNo).encryptedData;

    const spQuery = "CALL Register(?, ?, ?, ?, ?, ?, ?);";
    const spResults = await query(spQuery, [
      role_id,
      encryName,
      encryEmail,
      encryAddress,
      encryMobileNo,
      hashedPassword,
      createdAt,
    ]);

    const procRow = spResults?.[0]?.[0] || {};
    const message = procRow.message;
    const user_id = procRow.user_id;

    if (message?.toLowerCase().includes("exists")) {
      throw new AppError(message, 400);
    }
    if (!user_id) {
      throw new AppError("Registration failed", 500);
    }
    const [user] = await query(
      `SELECT user_id, user_email FROM tbl_users WHERE user_id = ? LIMIT 1`,
      [user_id]
    );
    if (!user) {
      throw new AppError("User record not found after registration", 500);
    }

    const [result] = await query(
      `
  SELECT EXISTS(
    SELECT 1 
    FROM tbl_access_passwords ap
    WHERE ap.access_pass_user_id = ?
  ) AS has_vault_password;
  `,
      [user_id]
    );

    const hasVaultPassword = !!result.has_vault_password;

    const sessionId = uuidv4();
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_address: user.user_address,
      session_id: sessionId,
      is_vault: hasVaultPassword,
    });

    const refreshToken = generateRefreshToken({
      user_id: user.user_id,
      session_id: sessionId,
    });

    await query(
      `INSERT INTO tbl_user_sessions (user_session_user_id, user_session_session_id, user_session_agent, user_refresh_token, created_at) VALUES (?,?,?,?,?)`,
      [
        user.user_id,
        sessionId,
        clientIsWeb ? "web" : "mobile",
        refreshToken,
        createdAt,
      ]
    );

    return ResponseBuilder.success("Registration successful.", {
      accessToken,
      refreshToken,
    });
  },

  // Refresh Token
  refreshAccessToken: async (refreshToken, updatedAt) => {
    let decoded = null;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return ResponseBuilder.unauthorized("Token expired");
    }

    if (!decoded) {
      throw new AppError("Invalid refresh token", 401);
    }

    const [session] = await query(
      `SELECT * FROM tbl_user_sessions WHERE user_session_user_id = ? AND user_session_session_id = ? AND user_refresh_token = ? LIMIT 1`,
      [decoded.user_id, decoded.session_id, refreshToken]
    );

    if (!session) {
      throw new AppError("Session not found for user", 401);
    }

    const [user] = await query(
      `SELECT * FROM tbl_users WHERE user_id = ? AND user_status = 1 LIMIT 1`,
      [decoded.user_id]
    );

    if (!user) {
      throw new AppError("User not found or inactive", 401);
    }

    const newSessionId = uuidv4();

    const newRefreshToken = generateRefreshToken({
      user_id: user.user_id,
      session_id: newSessionId,
    });

    const [result] = await query(
      `
  SELECT EXISTS(
    SELECT 1 
    FROM tbl_access_passwords ap
    WHERE ap.access_pass_user_id = ?
  ) AS has_vault_password;
  `,
      [user.user_id]
    );

    const hasVaultPassword = !!result.has_vault_password;

    const newAccessToken = generateAccessToken({
      user_name: user.user_name,
      user_id: user.user_id,
      session_id: newSessionId,
      is_vault: hasVaultPassword
    });

    await query(
      `UPDATE tbl_user_sessions SET user_session_session_id = ?, user_refresh_token = ?, updated_at = ? WHERE user_session_id = ?`,
      [newSessionId, newRefreshToken, updatedAt, session.user_session_id]
    );

    return ResponseBuilder.success("Access token refreshed", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  },

  // Logout User
  logoutUser: async (user_id, session_id, logoutAll) => {
    // Check if user exists and is active
    const [userRows] = await query(
      "SELECT * FROM tbl_users WHERE user_id = ? AND user_status = 1",
      [user_id]
    );

    if (!userRows) {
      throw new AppError("User not found or inactive", 400);
    }

    // Perform logout
    if (logoutAll) {
      await query(
        "DELETE FROM tbl_user_sessions WHERE user_session_user_id = ?",
        [user_id]
      );
    } else {
      await query(
        "DELETE FROM tbl_user_sessions WHERE user_session_user_id = ? AND user_session_session_id = ?",
        [user_id, session_id]
      );
    }
    return ResponseBuilder.success("Logout successful");
  },
};
