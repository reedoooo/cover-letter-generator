const userRoutes = require("./userRoutes");
const coverLetterRoutes = require("./coverLetterRoutes");

exports.setupRoutes = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api/cover-letter", coverLetterRoutes);
};
