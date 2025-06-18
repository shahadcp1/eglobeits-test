export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 422);
    this.errors = errors;
    this.errors = errors;
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  // Set default values if not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      status: err.status,
      message: err.message,
      stack: err.stack,
      errors: err.errors,
      code: err.code,
      meta: err.meta,
    });
  }

  // Handle duplicate field value (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate field value: ${field}. Please use another value.`;
    err = new ConflictError(message);
  }

  // Handle validation errors from express-validator
  if (err.errors && Array.isArray(err.errors) && err.errors[0]?.param) {
    const validationErrors = err.errors.reduce((acc: Record<string, string[]>, error: any) => {
      if (error.param) {
        if (!acc[error.param]) {
          acc[error.param] = [];
        }
        acc[error.param].push(error.msg);
      }
      return acc;
    }, {} as Record<string, string[]>);
    
    err = new ValidationError(validationErrors);
  }
  // Handle class-validator errors
  else if (err.errors && typeof err.errors === 'object') {
    err = new ValidationError(err.errors);
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    const errors: Record<string, string[]> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = [err.errors[key].message];
    });
    err = new ValidationError(errors);
  }

  if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    err = new UnauthorizedError('Token expired');
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    err = new ConflictError(`${field} already exists`);
  }

  if (err.code === 'P2025') {
    err = new NotFoundError('Record not found');
  }

  // Format the response
  const response: any = {
    status: err.status,
    message: err.message,
  };

  // Add errors if they exist
  if (err.errors) {
    response.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // For non-operational errors that we don't know about
  if (!err.isOperational) {
    console.error('ERROR 💥', err);
    response.message = 'Something went wrong!';
    response.status = 'error';
  }

  res.status(err.statusCode).json(response);
};
