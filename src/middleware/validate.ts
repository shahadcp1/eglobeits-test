import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (validations: ValidationChain[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages: Record<string, string[]> = {};
    errors.array().forEach(error => {
      const field = error.param;
      if (!errorMessages[field]) {
        errorMessages[field] = [];
      }
      errorMessages[field].push(error.msg);
    });

    next(new ValidationError(errorMessages));
  };
};
