import express, { json } from "express";
import { connect } from "mongoose";
import multer from "multer";
import csv from "csv-parser";
import { createReadStream, unlinkSync } from "fs";
import sharp from "sharp";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import ProcessingRequest from "./schemas/ProcessingRequestSchema.js";
import Product from "./schemas/ProductSchema.js";
import { validateCSV } from "./utils/helper.js";
import path from "path";
import { fileURLToPath } from "url";
import { processImagesWithWorkers } from "./workers/worker_functions.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(json());
app.use(
  "/processed_images",
  express.static(path.join(__dirname, "processed_images"))
);

// MongoDB connection
connect(process.env.MONGODB_URI || "mongodb://localhost:27017/image-processor");

// Multer configuration for CSV upload
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv") {
      cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});

// Upload API endpoint
app.post("/api/upload", upload.single("csv"), async (req, res) => {
  try {
    const requestId = uuidv4();
    const rows = [];

    // Parse CSV
    createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        // Validate CSV format
        if (!validateCSV(rows)) {
          return res.status(400).json({ error: "Invalid CSV format" });
        }

        // Create processing request
        const processingRequest = new ProcessingRequest({
          requestId,
          status: "pending",
          totalImages: rows.reduce(
            (acc, row) => acc + row["Input Image Urls"].split(",").length,
            0
          ),
          webhookUrl: req.body.webhookUrl,
        });
        await processingRequest.save();

        // Create product entries
        for (const row of rows) {
          const product = new Product({
            requestId,
            serialNumber: row["S. No."],
            productName: row["Product Name"],
            inputImageUrls: row["Input Image Urls"]
              .split(",")
              .map((url) => url.trim()),
            status: "pending",
          });
          await product.save();
        }

        // Start processing in background
        processImages(requestId);

        // Delete uploaded file
        unlinkSync(req.file.path);

        res.json({ requestId });
      });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Status API endpoint
app.get("/api/status/:requestId", async (req, res) => {
  try {
    const request = await ProcessingRequest.findOne({
      requestId: req.params.requestId,
    });
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const products = await Product.find({ requestId: req.params.requestId });

    res.json({
      status: request.status,
      progress: {
        total: request.totalImages,
        processed: request.processedImages,
      },
      products: products.map((p) => ({
        serialNumber: p.serialNumber,
        productName: p.productName,
        status: p.status,
        inputImageUrls: p.inputImageUrls,
        outputImageUrls: p.outputImageUrls,
      })),
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Background processing function
async function processImages(requestId) {
  try {
    const request = await ProcessingRequest.findOne({ requestId });
    request.status = "processing";
    await request.save();

    const products = await Product.find({ requestId });

    for (const product of products) {
      product.status = "processing";
      const outputUrls = await processImagesWithWorkers(product.inputImageUrls);
      
      product.outputImageUrls = outputUrls;
      product.status = outputUrls.length > 0 ? "completed" : "failed";
      await product.save();

      // Update request progress
      request.processedImages += outputUrls.length;
      await request.save();
    }

    request.status = "completed";
    await request.save();

    // Webhook trigger block
    if (request.webhookUrl) {
      try {
        await axios.get(request.webhookUrl);
      } catch (error) {
        console.error("Webhook trigger error:", error);
      }
    }
  } catch (error) {
    console.error("Processing error:", error);
    const request = await ProcessingRequest.findOne({ requestId });
    request.status = "failed";
    await request.save();
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
