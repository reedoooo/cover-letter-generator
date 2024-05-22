const userRoutes = require("./userRoutes");
const coverLetterRoutes = require("./coverLetterRoutes");

const setupRoutes = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api/cover-letter", coverLetterRoutes);
};

module.exports = setupRoutes;
