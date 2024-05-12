const mongoose = require("mongoose");
const logger = require("./winston");
const config = require(".");

exports.connectDB = async () => {
  try {
    await mongoose.connect(config.db);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
