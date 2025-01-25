# Image Processing Backend System

## Overview
A robust backend system for processing images from CSV files, built with Node.js, Express, and MongoDB.

## Features
- CSV file upload with image URLs
- Asynchronous image processing
- 50% quality image compression
- Status tracking for processing requests
- Webhook support
- Local image storage

## Prerequisites
- Node.js (v14+)
- MongoDB
- npm

## Tech Stack
- Backend: Express.js
- Database: MongoDB
- Image Processing: Sharp
- Additional Libraries: 
  - uuid
  - csv-parser
  - axios
  - multer

## Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd <project-directory>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create .env file in project root:
```bash
MONGODB_URI=mongodb://localhost:27017/image-processor
PORT=3000
```

### 4. Run Application
Create .env file in project root:
```bash
npm run start
```

### API Endpoints

#### Upload CSV

- **URL:** `/api/upload`
- **Method:** `POST`
- **Payload:** `Multipart form-data` with CSV file
- **Response:**
  ```json
  {
    "requestId": "string"
  }

#### Check Processing Status

- **URL:** `/api/status/:requestId`
- **Method:** `GET`
- **Response:**
Processing status and image details

### Local Image Access
Processed images accessible via:
http://localhost:3000/processed_images/[image-uuid].jpg
