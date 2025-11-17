import { jwtDecode } from "jwt-decode";
import { authService } from "./authService.js";
import { getEpochTime } from "../../utils/epoch.js";
import isWebClient from "../../utils/isWebClient.js";
import { ResponseBuilder } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/appError.js";
import { validatePassword } from "../../utils/validatePassword.js";

export const authController = {
  // Login User
  login: asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const clientIsWeb = isWebClient(req);

    if (!identifier || !password) {
      throw new AppError(
        "All fields are required: Email/Mobile number and password",
        400
      );
    }

    const result = await authService.login({
      identifier,
      password,
      clientIsWeb,
    });

    if (result.success && clientIsWeb) {
      res.cookie("refresh_token", result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      delete result.data.refreshToken;
      return res.status(result.statusCode).json(result);
    }

    return res.status(result.statusCode).json(result);
  }),

  // Register User
  register: asyncHandler(async (req, res) => {
    const { role_id , name, email, address,  mobileNo, password } = req.body;
    const clientIsWeb = isWebClient(req);
   console.log("result", req.body);

    const createdAt = getEpochTime();

    if (!name || !email || !mobileNo || !address) {
      throw new AppError(
        "All fields are required: name, email, address, mobile number and password",
        400
      );
    }
    if (!validatePassword(password)) {
      throw new AppError(
        "Password must be at least 8 characters long and combination of letter, number and special character",
        400
      );
    }

    const result = await authService.register({
      role_id,
      name,
      email,
      address,
      mobileNo,
      password,
      createdAt,
    });

    if (result.success && clientIsWeb) {
      res.cookie("refresh_token", result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      delete result.data.refreshToken;
      return res.status(result.statusCode).json(result);
    }

    return res.status(result.statusCode).json(result);
  }),

  // Reftresh Token
  refreshToken: asyncHandler(async (req, res) => {
    const clientIsWeb = isWebClient(req);
    const updatedAt = getEpochTime();
    let refreshToken = "";
    if (clientIsWeb) {
      refreshToken = req.cookies?.refresh_token;
    } else {
      const authHeader = req.header("Authorization");
      if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
        throw new AppError("No refresh token provided", 401);
      }
      refreshToken = authHeader.replace(/^Bearer\s+/i, "");
    }

    // If we still don’t have a token, bail out
    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    // Ask the service layer to generate a new access token
    const result = await authService.refreshAccessToken(
      refreshToken,
      updatedAt
    );

    // If successful and this is a web client, update the cookie
    if (result.success && clientIsWeb) {
      res.cookie("refresh_token", result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      delete result.data.refreshToken;
      return res.status(result.statusCode).json(result);
    }

    return res.status(result.statusCode).json(result);
  }),

  // Logout User
  logout: asyncHandler(async (req, res) => {
    const clientIsWeb = isWebClient(req);
    const { logoutAll = 0 } = req.body;

    let refreshToken = "";

    if (clientIsWeb) {
      refreshToken = req.cookies?.refresh_token;
    } else {
      const authHeader = req.header("Authorization");
      if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
        throw new AppError("No refresh token provided", 401);
      }
      refreshToken = authHeader.replace(/^Bearer\s+/i, "");
    }

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    let decoded;
    try {
      decoded = jwtDecode(refreshToken);
    } catch (error) {
      const err = ResponseBuilder.unauthorized("Invalid refresh token format");
      return res.status(err.statusCode).json(err);
    }

    const { user_id, session_id } = decoded || {};
    if (!user_id || !session_id) {
      throw new AppError("Malformed refresh token", 401);
    }

    const result = await authService.logoutUser(user_id, session_id, logoutAll);

    if (result.success && clientIsWeb) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
    }

    return res.status(result.statusCode).json(result);
  }),


};
