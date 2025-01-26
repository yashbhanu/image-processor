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

## Worker Functions

### Overview
Worker threads provide parallel image processing capabilities, improving system performance and efficiency.

### Implementation Details
- **Library**: Node.js Worker Threads
- **Processing Strategy**: Concurrent image processing
- **Max Concurrency**: Configurable (default: 3 parallel workers)

### Worker Thread Lifecycle
1. Create worker for each image URL
2. Download image
3. Compress image
4. Save processed image
5. Return processed image URL

### System Architechture Diagram
https://drive.google.com/file/d/1zn1JX-dlPfgNgiQSyb7HLlsEiEXvJ3gn/view?usp=sharing

### Demo CSV Link
https://docs.google.com/spreadsheets/d/1YNaF2YRoAVL6wMO2adWARFKEO4I-xlbqxVGWOrVyxAo/edit?usp=sharing

### Postman Collection Link
https://www.postman.com/joint-operations-astronaut-29714134/workspace/postman-image-process-api/collection/19756741-32f4547e-6df6-497d-a7af-0c23e133c919?action=share&creator=19756741

### Local Image Access
Processed images accessible via:
http://localhost:3000/processed_images/[image-uuid].jpg

### Limitations & Future Improvments
Currently the processed images can be accessed only using the local server. In Future Improvements, the images can be uploaded to a cloud service like AWS S3(Simple Storage Service) & can be accessed directly anytime from anywhere.