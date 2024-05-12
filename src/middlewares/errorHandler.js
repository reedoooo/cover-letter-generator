const logger = require("../config/winston");

exports.errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res
    .status(err.status || 500)
    .json({ message: "Server Error", error: err.message });
};
