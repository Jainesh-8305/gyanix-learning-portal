// backend/src/middleware/errorHandler.js
// Note: Express identifies error-handling middleware by the 4-arg signature.
// _next is required in the signature but intentionally never called here.
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join('. ');
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

  // External payment gateway errors (Stripe) must NEVER return 401
  if (err.type?.startsWith('Stripe') || err.name?.startsWith('Stripe') || err.rawType) {
    statusCode = 502;
    message = `Payment service error: ${err.message || 'Unable to connect to payment provider'}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;