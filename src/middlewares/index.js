const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { morganMiddleware } = require("./morganMiddleware");
const path = require("path");

/**
 * Configures and applies middlewares to the Express application.
 *
 * @param {Object} app - The Express application instance.
 */
const middlewares = (app) => {
  // Set up Helmet for enhanced security, including Content Security Policy (CSP)
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
      },
    })
  );

  // Use Morgan middleware for logging HTTP requests
  app.use(morganMiddleware);

  // Enable response compression for better performance
  app.use(compression({ threshold: 512 }));

  // Parse incoming JSON requests
  app.use(express.json());

  // Parse URL-encoded data
  app.use(express.urlencoded({ extended: true }));

  // Parse cookies attached to client requests
  app.use(cookieParser());

  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, "../public")));

  // Serve static files from the 'generated' directory
  app.use("/generated", express.static(path.join(__dirname, "../generated")));

  // Configure CORS settings
  const corsOptions = {
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Apply rate limiting to prevent abuse and improve security
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per window
    })
  );
};

module.exports = middlewares;
