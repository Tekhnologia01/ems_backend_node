import { adminService } from "./adminAuthService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getEpochTime } from "../../utils/epoch.js";
import isWebClient from "../../utils/isWebClient.js";
import { AppError } from "../../middlewares/appError.js";
import { ResponseBuilder } from "../../utils/response.js";
import { jwtDecode } from "jwt-decode";

export const adminController = {
  // LOGIN
  login: asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      throw new AppError("Email/Mobile & password required", 400);
    }

    const result = await adminService.login({
      identifier,
      password,
    });

    return res.status(result.statusCode).json(result);
  }),

  adminRegister: asyncHandler(async (req, res) => {
    const {
      admin_name,
      admin_email,
      admin_mobile_no,
      admin_password,
      admin_address,
    } = req.body;

    if (!admin_name || !admin_email || !admin_mobile_no || !admin_address || !admin_password) {
      throw new AppError(
        "All fields are required: name, email, address, mobile number and password",
        400
      );
    }

    const result = await adminService.register({
      admin_name,
      admin_email,
      admin_mobile_no,
      admin_password,
      admin_address
    });

    return res.status(result.statusCode).json(result);
  }),

  // REFRESH TOKEN
  refreshToken: asyncHandler(async (req, res) => {
    const clientIsWeb = isWebClient(req);
    let refreshToken = "";

    if (clientIsWeb) refreshToken = req.cookies?.refresh_token_admin;
    else refreshToken = req.header("Authorization")?.replace("Bearer ", "");

    if (!refreshToken) throw new AppError("No refresh token", 401);

    const updatedAt = getEpochTime();
    const result = await adminService.refreshToken(refreshToken, updatedAt);

    if (clientIsWeb) {
      res.cookie("refresh_token_admin", result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
      });

      delete result.data.refreshToken;
    }

    return res.status(result.statusCode).json(result);
  }),

  // LOGOUT
  logout: asyncHandler(async (req, res) => {
    let token =
      req.cookies?.refresh_token_admin ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new AppError("No token provided", 401);

    const decoded = jwtDecode(token);
    const result = await adminService.logout(
      decoded.admin_id,
      decoded.session_id,
      req.body.logoutAll
    );

    res.clearCookie("refresh_token_admin", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    return res.status(result.statusCode).json(result);
  }),
};
