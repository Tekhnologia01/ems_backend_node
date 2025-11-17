import ExcelJS from "exceljs";
import { encrypt } from "./encryption.js";

/**
 * Parses an Excel buffer and returns an array of numbers from the first column.
 * Assumes no headers — each row contains a single mobile number.
 *
 * @param {Buffer} fileBuffer - The buffer from the uploaded Excel file
 * @returns {Promise<Array<number>>} Parsed mobile numbers
 */
export async function parseExcelFile(fileBuffer) {
  if (
    !fileBuffer ||
    (!Buffer.isBuffer(fileBuffer) &&
      !(fileBuffer instanceof Uint8Array || fileBuffer instanceof DataView))
  ) {
    throw new Error("Invalid file buffer passed to Excel parser.");
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];
    const mobileNumbers = [];

    worksheet.eachRow({ includeEmpty: false }, (row) => {
      let rawValue = row.getCell(1).text?.trim();

      // Fallback if `.text` is not valid
      if (!rawValue || !/^\d{10}$/.test(rawValue)) {
        const cellValue = row.getCell(1).value;

        if (typeof cellValue === "number") {
          rawValue = cellValue.toFixed(0); // Fix scientific notation (e.g., 9.87e+9)
        } else if (typeof cellValue === "string") {
          rawValue = cellValue.trim();
        }
      }

      if (rawValue && /^\d{10}$/.test(rawValue)) {
        const encryptedNumber = encrypt(rawValue).encryptedData;
        mobileNumbers.push(encryptedNumber);
      }
    });

    return mobileNumbers;
  } catch (err) {
    throw new Error("Failed to parse Excel file: " + err.message);
  }
}
