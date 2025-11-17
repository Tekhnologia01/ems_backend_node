import { verifyToken } from "../utils/jwt.js";
import { ResponseBuilder } from "../utils/response.js";

export const checkJWT = async (req, res, next) => {
  try {
    const urlsWithoutToken = [
      "/user/send-otp",
      "/user/verify-otp",
      "/user/reset-password",
      "/auth/refresh-token",
      "/auth/login",
      "/auth/register",
    ];

    const guestRoutes = ["/event/access-event"];

    if (
      urlsWithoutToken.includes(req.url) ||
      guestRoutes.some((url) => req.url.startsWith(url))
    ) {
      return next();
    }

    const authHeader = req.header("Authorization");

    if (!authHeader) {
      const unauthorizedRequestResponse = ResponseBuilder.unauthorized(
        "Please provide token"
      );
      return res
        .status(unauthorizedRequestResponse.statusCode)
        .json(unauthorizedRequestResponse);
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const payload = verifyToken(token);

    if (!payload) {
      const badRequestResponse = ResponseBuilder.badRequest(
        "Invalid token payload"
      );
      return res.status(badRequestResponse.statusCode).json(badRequestResponse);
    }

    req.user = payload;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Invalid Token" });
  }
};
