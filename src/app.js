require("dotenv").config();
const express = require("express");
const logger = require("./config/winston");
const { connectDB } = require("./config/database");
const { unifiedErrorHandler } = require("./middlewares/unifiedErrorHandler");
const setupRoutes = require("./routes");
const middlewares = require("./middlewares");
const path = require("path");

const app = express();

// Setup middlewares
middlewares(app);

// Setup routes
setupRoutes(app);

// Connect to MongoDB and start server
async function main() {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "test") {
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
    }
  } catch (error) {
    logger.error(`Failed to start the server: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
}

main();

// Error handling middleware
app.use(unifiedErrorHandler);

module.exports = app;
