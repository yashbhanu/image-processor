import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import axios from "axios";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processImagesWithWorkers(imageUrls, maxConcurrency = 3) {
  const processedUrls = [];
  const workers = [];

  // Create a pool of worker threads
  for (const imageUrl of imageUrls) {
    if (workers.length >= maxConcurrency) {
      await Promise.race(workers);
    }

    const workerPromise = new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { imageUrl },
      });

      worker.on("message", (processedUrl) => {
        processedUrls.push(processedUrl);
        resolve(processedUrl);
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });

    workers.push(workerPromise);
  }

  await Promise.all(workers);
  console.log({processedUrls})

  return processedUrls;
}

if (!isMainThread) {
  async function processImageWorker(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      const filename = `${uuidv4()}.jpg`;
      const outputPath = path.join(
        __dirname,
        "..",
        "processed_images",
        filename
      );

      fs.mkdirSync(path.join(__dirname, "..", "processed_images"), {
        recursive: true,
      });

      await sharp(response.data).jpeg({ quality: 50 }).toFile(outputPath);

      // Return local file path
      const outputUrl = `http://localhost:3000/processed_images/${filename}`;
      parentPort.postMessage(outputUrl);
    } catch (error) {
      console.error(`Worker error processing ${imageUrl}:`, error);
      parentPort.postMessage(null);
    }
  }

  processImageWorker(workerData.imageUrl);
}

export { processImagesWithWorkers };
