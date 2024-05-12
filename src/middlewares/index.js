const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const config = require("../config");
const rateLimit = require("express-rate-limit");
const { morganMiddleware } = require("../config/morgan");
const express = require("express");

exports.setupMiddlewares = (app) => {
  app.use(helmet());
  app.use(morganMiddleware);
  app.use(compression({ threshold: 512 }));
  app.use(cookieParser());
  app.use(cors());
  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: config.db,
        collectionName: "sessions",
        autoRemove: "interval",
        autoRemoveInterval: 10,
      }),
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })
  );
};
