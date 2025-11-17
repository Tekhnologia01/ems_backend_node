import { pool } from '../initializers/dbConnection.js';
/**
 * Run a parameterised query and return the raw result rows.
 * @param {string} sql
 * @param {any[]} values
 * @returns {Promise<any[]>}
 */
export const query = async (sql, values = []) => {
  try {
    const [results] = await pool.query(sql, values);
    return results;
  } catch (err) {
    console.error('Error executing query:', err.message);
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
    const placeholders = params.map(() => '?').join(', ');
    const sql = `CALL ${procName}(${placeholders})`;
    const [results] = await pool.query(sql, params);
    return results;
  } catch (err) {
    console.error(`Error executing stored procedure ${procName}:`, err.message);
    throw err;
  }
};
