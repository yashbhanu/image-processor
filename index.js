import express, { json } from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(json());

// MongoDB connection
connect(process.env.MONGODB_URI || "mongodb://localhost:27017/image-processor");

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
