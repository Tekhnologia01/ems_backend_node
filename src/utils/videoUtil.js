import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import sharp from "sharp";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function generateVideoThumbnail(videoUrl) {
  return new Promise((resolve, reject) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "thumb-"));
    const outputPath = path.join(tmpDir, `thumb-${Date.now()}.jpg`);

    const snapshotTimes = [2, 5, 10, 15, 20];
    let attempts = 0;

    const isVisuallyEmpty = async (filePath) => {
      const { data, info } = await sharp(filePath)
        .raw()
        .toBuffer({ resolveWithObject: true });

      let black = 0,
        white = 0;
      const total = info.width * info.height;

      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];

        if (r < 16 && g < 16 && b < 16) black++;
        if (r > 240 && g > 240 && b > 240) white++;
      }

      return black / total > 0.9 || white / total > 0.9;
    };

    const tryCapture = (time) => {
      ffmpeg(videoUrl)
        .on("error", (err) => {
          cleanup();
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on("end", async () => {
          try {
            const empty = await isVisuallyEmpty(outputPath);

            if (empty && attempts < snapshotTimes.length - 1) {
              attempts++;
              return tryCapture(snapshotTimes[attempts]);
            }

            if (empty) {
              cleanup();
              return reject(
                new Error("All attempted frames are visually empty")
              );
            }

            const buffer = await sharp(outputPath)
              .resize({ width: 480 })
              .webp({ quality: 80 })
              .toBuffer();

            cleanup();
            resolve(buffer);
          } catch (e) {
            cleanup();
            reject(e);
          }
        })
        .screenshots({
          count: 1,
          timemarks: [time],
          filename: path.basename(outputPath),
          folder: tmpDir,
          size: "640x?",
        });
    };

    const cleanup = () => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      if (fs.existsSync(tmpDir)) {
        fs.rmdirSync(tmpDir, { recursive: true });
      }
    };

    tryCapture(snapshotTimes[attempts]);
  });
}
