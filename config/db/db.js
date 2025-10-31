const mongoose = require("mongoose");
const logger = require("../../utils/winston/logger");
require("dotenv").config();
const uri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    logger.info("✅ MongoDB Atlas connected");
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`, { error });
    process.exit(1);
  }
};
module.exports = connectDB;
