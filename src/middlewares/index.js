const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const config = require("../config");
const rateLimit = require("express-rate-limit");
const express = require("express");
const { morganMiddleware } = require("./morganMiddleware");

exports.setupMiddlewares = (app) => {
  app.use(helmet());
  app.use(morganMiddleware);
  app.use(compression({ threshold: 512 }));
  app.use(cookieParser());
  app.use(cors());
  app.use(express.json());
  // In your middleware or test setup file
  // if (process.env.NODE_ENV !== "test") {
  //   app.use(
  //     session({
  //       secret:
  //         "547623567e04d62d3ccb6f9332e7cb22fec2edd13f1391a4e00d058db12bcdff", // Use a random string for the secret
  //       resave: false,
  //       saveUninitialized: false,
  //       store: MongoStore.create({
  //         mongoUrl: config.db,
  //         collectionName: "sessions",
  //         autoRemove: "interval",
  //       }),
  //     })
  //   );
  // }

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })
  );
};
