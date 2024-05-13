require("dotenv").config();
const express = require("express");
const logger = require("./config/winston");
const { setupMiddlewares } = require("./middlewares");
const { setupRoutes } = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");
const { connectDB } = require("./config/database");

const app = express();

// Setup middlewares
setupMiddlewares(app);

// Setup routes
setupRoutes(app);

// Connect to MongoDB
async function main() {
  await connectDB();
  // any other initialization code
}

if (process.env.NODE_ENV !== "test") {
  main().catch(console.error);
}

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
}

module.exports = app;
