import sharp from "sharp";

const MAX_THUMBNAIL_BYTES = 1 * 1024 * 1024; // 1 MB
const TARGET_WIDTH = 1280;

// High-quality, size-capped thumbnail generator
export const generateImageThumbnail = async (originalBuffer) => {
  const metadata = await sharp(originalBuffer).metadata();
  const resizeWidth =
    metadata.width && metadata.width > TARGET_WIDTH
      ? TARGET_WIDTH
      : metadata.width;

  let minQ = 40;
  let maxQ = 95;
  let bestBuffer = null;
  let bestQuality = minQ;

  while (minQ <= maxQ) {
    const midQ = Math.floor((minQ + maxQ) / 2);
    const buffer = await sharp(originalBuffer)
      .resize({ width: resizeWidth, fit: "inside", withoutEnlargement: true })
      .webp({ quality: midQ, effort: 4 })
      .toBuffer();

    if (buffer.length <= MAX_THUMBNAIL_BYTES) {
      bestBuffer = buffer;
      bestQuality = midQ;
      minQ = midQ + 1;
    } else {
      maxQ = midQ - 1;
    }
  }

  if (!bestBuffer) {
    throw new Error("Unable to generate a thumbnail under 1MB.");
  }

  console.log(
    `Thumbnail size: ${(bestBuffer.length / 1024).toFixed(
      1
    )} KB @ quality ${bestQuality}`
  );
  return bestBuffer;
};
