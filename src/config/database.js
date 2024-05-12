const mongoose = require("mongoose");
const logger = require("./winston");
const config = require(".");

exports.connectDB = async () => {
  try {
    await mongoose.connect(config.db);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};
