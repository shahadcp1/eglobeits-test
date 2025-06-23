// Import Prisma client to access error types
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const errorHandler = (err, req, res, next) => {
  console.error('Error handler:', err);
  console.error('Error stack:', err.stack);

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'A record with this data already exists',
        errors: [{
          msg: 'Duplicate entry',
          param: err.meta?.target?.[0] || 'unknown',
          value: req.body[err.meta?.target?.[0]]
        }]
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'The requested resource was not found',
        errors: [{
          msg: 'Not found',
          param: 'id',
          value: err.meta?.cause || 'unknown'
        }]
      });
    }
  }

  // Handle custom errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle validation errors from express-validator
  if (Array.isArray(err) && err.some(e => e.msg)) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err
    });
  }

  // Default error response
  const statusCode = 500;
  res.status(statusCode).json({
    status: 'error',
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
};

module.exports = errorHandler;
