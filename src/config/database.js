const mongoose = require("mongoose");
const logger = require("./winston");
const config = require(".");

const connectDB = async () => {
  try {
    // await mongoose.connect(config.db);
    const conString = config.db;
    const conn = await mongoose.connect(conString);
    logger.info(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
    // process.exit(1);
  }
};

module.exports = { connectDB };
