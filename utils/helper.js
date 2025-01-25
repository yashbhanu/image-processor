import path from "path";
import sharp from 'sharp';
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import axios from "axios";
import { fileURLToPath } from 'url';

// function to validate CSV format
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateCSV = (rows) => {
  for (const row of rows) {
    if (!row["S. No."] || !row["Product Name"] || !row["Input Image Urls"]) {
      return false;
    }
    // Validate URLs format
    const urls = row["Input Image Urls"].split(",").map((url) => url.trim());
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        return false;
      }
    }
  }
  return true;
};

// function to process image
async function processImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const filename = `${uuidv4()}.jpg`;
    const outputPath = path.join(__dirname, '..', 'processed_images', filename);

    fs.mkdirSync(path.join(__dirname, '..', 'processed_images'), { recursive: true });

    await sharp(response.data)
      .jpeg({ quality: 50 })
      .toFile(outputPath);

    // Return local file path 
    const outputUrl = `http://localhost:3000/processed_images/${filename}`;
    return outputUrl;
  } catch (error) {
    console.error(`Error processing image: ${imageUrl}`, error);
    throw error;
  }
}

export { validateCSV, processImage };
