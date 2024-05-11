// Import necessary modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const morgan = require("morgan");
// Initialize express application
const app = express();

// Load environment variables
dotenv.config();

// Middleware for security headers
app.use(helmet());

// morgan
app.use(morgan("common"));

// Enable CORS with default settings
app.use(cors());

// Built-in middleware to parse incoming JSON requests
app.use(express.json());

// Rate limiting to prevent abuse of the service
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Import routes
const coverLetterRoutes = require("./routes/coverLetterRoutes");

// Use routes
app.use("/api", coverLetterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the configured app
module.exports = app;
