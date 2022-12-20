import { validationResult } from 'express-validator';

/**
 * If the validation result is valid, then call the next function. If the validation result is invalid,
 * then send a 403 status code and the error array.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 * @returns the next() function.
 */
const validateResults = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error) {
    res.status(403);
    res.json({ errors: error.array() });
  }
};

export default validateResults;
