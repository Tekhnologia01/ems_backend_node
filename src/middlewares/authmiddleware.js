import jwt from 'jsonwebtoken';
import { pool } from '../initializers/dbConnection.js';
// import { JWT_SECRET } from '../config/jwt.js';
export const verifyAdmin = async (req, res, next) => {
  process.env.JWT_SECRET
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).send({ message: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach admin info (including db_name) to req
    const [rows] = await pool.query('SELECT db_name, admin_status FROM tbl_admin_user WHERE admin_user_id = ?', [decoded.admin_user_id]);
    const admin = rows[0];
    if (!admin || admin.admin_status !== 1) return res.status(401).send({ message: 'User inactive' });

    req.user = { admin_user_id: decoded.admin_user_id, is_superadmin: decoded.is_superadmin, db_name: admin.db_name };
    next();
  } catch (err) { next(err); }
};
