import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { getEpochTime } from "./epoch.js";
import { decrypt } from "./encryption.js";
import { query } from "./database.js";

dotenv.config();

const CONNECTION = process.env.AZURE_CONNECTION_STRING;
const MEDIA_CONTAINER_NAME = process.env.MEDIA_CONTAINER;
const THUMBNAIL_CONTAINER_NAME = process.env.MEDIA_THUMBNAIL_CONTAINER;
const STATIC_KEY = process.env.STATIC_KEY;

export function generateUniqueBlobName() {
  return uuidv4();
}

function getSharedKeyCredential(connectionString) {
  const parts = connectionString.split(";");
  const map = {};

  for (const part of parts) {
    const [key, value] = part.split("=");
    map[key] = value;
  }

  if (!map.AccountName || !map.AccountKey) {
    throw new Error("Invalid Azure Storage connection string");
  }

  return new StorageSharedKeyCredential(map.AccountName, map.AccountKey);
}

export function generateSasToken(
  blobName,
  containerName,
  connectionString,
  permissions = "racw"
) {
  const credential = getSharedKeyCredential(connectionString);
  const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse(permissions),
      expiresOn,
    },
    credential
  ).toString();

  return sasToken;
}

export async function verifyBlob(
  blobName,
  containerName,
  connectionString,
  expectedSize
) {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const exists = await blobClient.exists();
    if (!exists) return false;

    const props = await blobClient.getProperties();
    return props.contentLength === expectedSize;
  } catch (error) {
    console.error("Error verifying blob:", error.message);
    return false;
  }
}

export const removeInvalidImg = async (blobName) => {
  const blobService = BlobServiceClient.fromConnectionString(CONNECTION);
  const containerClient = blobService.getContainerClient(MEDIA_CONTAINER_NAME);

  const blobClient = containerClient.getBlobClient(blobName);

  const exists = await blobClient.exists();
  if (!exists) {
    console.warn(`Blob not found, skipping deletion: ${blobName}`);
    return;
  }

  try {
    await blobClient.delete();
    console.log(`Deleted blob: ${blobName}`);
  } catch (error) {
    console.error(`Failed to delete blob ${blobName}:`, error.message);
  }
};

//Cleanup Deleted media after 30 DAYS
export const removeDeletedMediaAfterDays = async (days) => {
  const cutoffTime = getEpochTime() - days * 86400 * 1000;

  const results = await query(
    `SELECT media_id, media_name FROM tbl_media WHERE deleted_at IS NOT NULL AND deleted_at < ?`,
    [cutoffTime]
  );

  if (!results.length) {
    console.log("No expired deleted media found.");
    return;
  }

  const blobService = BlobServiceClient.fromConnectionString(CONNECTION);
  const mediaContainer = blobService.getContainerClient(MEDIA_CONTAINER_NAME);
  const thumbnailContainer = blobService.getContainerClient(
    THUMBNAIL_CONTAINER_NAME
  );

  for (const { media_id, media_name } of results) {
    try {
      const decryptedBlob = decrypt(media_name, STATIC_KEY);

      // Delete from Azure media + thumbnail containers
      await mediaContainer.deleteBlobIfExists(decryptedBlob);
      await thumbnailContainer.deleteBlobIfExists(decryptedBlob);

      // Clean DB
      await query(`DELETE FROM tbl_media WHERE media_id = ?`, [media_id]);
      await query(`DELETE FROM tbl_media_type WHERE media_id = ?`, [media_id]);

      console.log(`Deleted media: ${media_id}`);
    } catch (err) {
      console.error(`Failed to delete media ${media_id}:`, err.message);
    }
  }
};

// Verify blob existence with retry logic for transient Azure errors.
export const verifyBlobWithRetry = async (
  blobName,
  containerName,
  connectionString,
  expectedSize,
  maxRetries = 3
) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const exists = await verifyBlob(
        blobName,
        containerName,
        connectionString,
        expectedSize
      );
      if (exists) return true;
    } catch (err) {
      console.error(`verifyBlob failed (attempt ${attempt + 1}):`, err.message);
    }

    attempt++;
    await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt)); // exponential backoff
  }

  return false;
};
