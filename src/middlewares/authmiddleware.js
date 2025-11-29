
import jwt from "jsonwebtoken";
import { pool } from "../initializers/dbConnection.js";


export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check token present
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 2. Extract token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // 3. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 4. Fetch Admin Info from DB
    const [rows] = await pool.query(
      "SELECT admin_user_id, db_name, admin_status, role FROM tbl_admin_user WHERE admin_user_id = ?",
      [decoded.admin_user_id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const admin = rows[0];

    // 5. Check active status
    if (admin.admin_status !== 1) {
      return res.status(403).json({ message: "Admin account inactive" });
    }

    // 6. Attach user to request
    req.user = {
      admin_user_id: admin.admin_user_id,
      role: admin.role,
      db_name: admin.db_name,
      is_superadmin: decoded.is_superadmin || false,
    };

    next();
  } catch (err) {
    console.error("verifyAdmin Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
