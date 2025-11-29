// import {
//   childDbConnection,
//   getChildDB,
// } from "../initializers/childDbConnection.js";
import { getActiveDB } from "../initializers/childDbConnection.js";
import { pool } from "../initializers/dbConnection.js";

/**
 * Run a parameterised query and return the raw result rows.
 * @param {string} sql
 * @param {any[]} values
 * @returns {Promise<any[]>}
 */
export const query = async (sql, values = []) => {
  try {
    const [rows] = await pool.query(sql, values);
    return rows;
  } catch (err) {
    console.error("DB Query Error:", err.sqlMessage || err.message);
    throw err;
  }
};
// ========================

export const childQuery = async ( sql, values = []) => {
  try {
    const [rows] = await getActiveDB().query(sql, values);
    return rows;
  } catch (err) {
    console.error("DB Query Error:", err.sqlMessage || err.message);
    throw err;
  }
};

/**
 * Call a stored procedure with positional parameters.
 * @param {string} procName
 * @param {any[]} params
 * @returns {Promise<any>}
 */
export const executeStoredProcedure = async (procName, params = []) => {
  try {
    const placeholders = params.length ? params.map(() => "?").join(", ") : "";
    const sql = `CALL ${procName}(${placeholders})`;

    const [resultSets] = await pool.query(sql, params);

    // MySQL stored procedures usually return results inside first result set
    return resultSets;
  } catch (err) {
    console.error(
      `Stored Procedure Error (${procName}):`,
      err.sqlMessage || err.message
    );
    throw err;
  }
};
