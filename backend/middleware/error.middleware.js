import { AppError } from "../utils/appError.js";

// Specific Error Converters for Mongoose & JWT
const handleCastErrorDB = (err) => {
  const message = `Invalid resource identifier: "${err.value}" for field "${err.path}"`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.keyValue ? err.keyValue[field] : "specified value";
  const message = `Duplicate value: "${value}" already exists for ${field}. Please use another value.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError("Database validation failed", 422, errors);
};

const handleJWTError = () =>
  new AppError("Invalid authentication token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Authentication session expired. Please log in again.", 401);

// Send detailed error diagnostics in Development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    details: err.details || null,
    stack: err.stack,
    error: err,
  });
};

// Send safe, sanitized error response in Production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      details: err.details || null,
    });
  } else {
    // 1) Log critical internal bug for server observability
    console.error("💥 UNHANDLED PROGRAMMING ERROR:", err);

    // 2) Send generic friendly message to client without leaking internals
    res.status(500).json({
      success: false,
      status: "error",
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

/**
 * Express Centralized Error Handling Middleware.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;

  // Convert Mongoose & Auth errors into Operational AppErrors
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default errorHandler;
