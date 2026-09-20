import type { NextFunction, Request, Response } from 'express';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';
import { verifyToken } from '../utilities/handleJwt.js';

/**
 * It checks if the incoming request has a valid JWT, and if it does, it adds the user data to the
 * request object
 */
const checkValidJwt = (req: Request, res: Response, next: NextFunction) => {
  try {
    const incomingJwt = req.headers.authorization || '';
    if (incomingJwt.split(' ')[0] !== 'Bearer')
      return handleHttpErrors(res, 'ERROR_EXPECTED_BEARER', 401);
    const jwt = incomingJwt.split(' ').pop() as string;
    const userData = verifyToken(jwt);
    if (!userData)
      return handleHttpErrors(res, 'ERROR_NOT_VALID_SESSION_CREDENTIALS', 401);
    req.userData = userData;
    next();
  } catch {
    handleHttpErrors(res, 'ERROR_SESSION');
  }
};

export { checkValidJwt };
