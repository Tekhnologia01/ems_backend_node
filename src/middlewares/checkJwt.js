import { verifyAccessToken } from "../utils/jwt.js";
import { ResponseBuilder } from "../utils/response.js";

export const checkJWT = (req, res, next) => {
  try {
    const publicRoutes = [
      "/user/send-otp",
      "/user/verify-otp",
      "/user/reset-password",
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",

      "/adminAuth/reset-password",
      "/adminAuth/login",
      "/adminAuth/register",
      "/adminAuth/refresh-token",
    // "/voter/addVoter"
    ];

    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(
        ResponseBuilder.unauthorized("Token missing")
      );
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json(
        ResponseBuilder.unauthorized("Invalid token")
      );
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json(
      ResponseBuilder.unauthorized("Invalid token")
    );
  }
};