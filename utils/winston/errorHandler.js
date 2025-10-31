// middleware/errorHandler.js
const logger = require("./logger"); // Adjust if path is different

const errorHandler = (err, req, res, next) => {
  logger.error(`❌ ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
