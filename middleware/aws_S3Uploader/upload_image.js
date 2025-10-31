// upload.js
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
require("dotenv").config();
const sharp = require("sharp");
const logger = require('../../utils/winston/logger')

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFileToS3 = async (file) => {
  try {
    // 🗜️ Compress image using Sharp (resize to max width 1200px)
    const compressedBuffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1200 }) // adjust width as needed
      .jpeg({ quality: 80 }) // reduce quality slightly
      .toBuffer();

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET,
        Key: `images/${Date.now()}-${file.originalname}`,
        Body: compressedBuffer,
        ContentType: file.mimetype,
      },
    });

    const result = await upload.done();

    return result.Location;
  } catch (error) {
    throw new Error("Failed to upload file to S3");
  }
};

// ✅ Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

module.exports = { upload, uploadFileToS3 };
