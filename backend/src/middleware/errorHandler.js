// backend/src/middleware/errorHandler.js
// Note: Express identifies error-handling middleware by the 4-arg signature.
// _next is required in the signature but intentionally never called here.
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier or value';
  }
  if (err instanceof SyntaxError || err.name === 'MulterError') {
    statusCode = 400;
    message = 'Invalid request or upload limit exceeded';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired. Please log in again.';
    statusCode = 401;
  }

  if (statusCode >= 500) {
    console.error('Request failed:', err.message);
    message =
      statusCode === 503
        ? 'Service unavailable. Please try again later.'
        : 'Service request failed. Please try again later.';
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
