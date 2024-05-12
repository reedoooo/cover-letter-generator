const logger = require("../config/winston");

exports.errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
};
