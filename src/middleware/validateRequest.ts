import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestError } from '../utils/errors';

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    throw new BadRequestError('Validation error', errors.array());
  };
};

export { validateRequest };
