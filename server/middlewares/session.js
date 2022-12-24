import { handleHttpErrors } from '../utilities/handleHttpErrors.js';
import { verifyToken } from '../utilities/handleJwt.js';

/**
 * It checks if the incoming request has a valid JWT, and if it does, it adds the user data to the
 * request object
 * @param req - The request object
 * @param res - the response object
 * @param next - The next middleware function in the stack.
 * @returns a function.
 */
const checkValidJwt = (req, res, next) => {
  try {
    const incomingJwt = req.headers.authorization || '';
    if (incomingJwt.split(' ')[0] !== 'Bearer')
      return handleHttpErrors(res, 'ERROR_EXPECTED_BEARER', 401);
    const jwt = incomingJwt.split(' ').pop();
    const userData = verifyToken(jwt);
    if (!userData)
      return handleHttpErrors(res, 'ERROR_NOT_VALID_SESSION_CREDENTIALS', 401);
    req.userData = userData;
    next();
  } catch (error) {
    handleHttpErrors(res, 'ERROR_SESSION');
  }
};

export { checkValidJwt };
