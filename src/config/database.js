const mongoose = require("mongoose");
const logger = require("./winston");
const config = require(".");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db);
    logger.info(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = { connectDB };
