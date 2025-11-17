// utils/getUserName.js
import { query } from "./database.js";

export async function getColumnValue(tableName, selectionColumn, columnValue, conditionColumn) {
  const sql = `
    SELECT \`${selectionColumn}\` AS value
    FROM \`${tableName}\`
    WHERE \`${conditionColumn}\` = ?
    LIMIT 1
  `;
  const result = await query(sql, [columnValue]);
  return result.length ? result[0].value : null;
}
