const app = require("./src/app");
const logger = require("./src/config/winston");
const { connectDB } = require("./src/config/database");

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
