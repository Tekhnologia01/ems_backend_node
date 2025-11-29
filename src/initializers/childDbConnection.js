// // src/config/dbTenant.js
// import mysql from "mysql2/promise";
// import { late } from "zod/v3";

// export const childDbConnection = new Map(); // cache
// export const getChildDB = async (dbName) => {
//   if (!dbName) throw new Error("Tenant database name missing in token.");
  
//   if (childDbConnection.has(dbName)) {
//     return childDbConnection.get(dbName);
//   }

//   const connection = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: dbName,
//     waitForConnections: true,
//     connectionLimit: 10
//   });

//   childDbConnection.set(dbName, connection);
//   return connection;
// };

import mysql from "mysql2/promise";

const tenantPools = new Map();
let activeConnection = null; // 🟢 global active DB reference

export const getTenantDB = async (dbName) => {
  if (!dbName) throw new Error("Tenant database name missing.");

  if (tenantPools.has(dbName)) {
    activeConnection = tenantPools.get(dbName);
    return activeConnection;
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
  });

  tenantPools.set(dbName, pool);
  activeConnection = pool;
  return pool;
};

// 🟢 Used by service layer
export const getActiveDB = () => {
  if (!activeConnection) throw new Error("No active tenant DB selected yet.");
  return activeConnection;
};
