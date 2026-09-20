import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * If the validation result is valid, then call the next function. If the validation result is invalid,
 * then send a 403 status code and the error array.
 */
const validateResults = (req: Request, res: Response, next: NextFunction) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error: unknown) {
    res.status(403);
    const err = error as { array: () => unknown[] };
    res.json({ errors: err.array() });
  }
};

export default validateResults;
