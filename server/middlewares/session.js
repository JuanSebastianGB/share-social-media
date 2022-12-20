import { handleHttpErrors } from '../utilities/handleHttpErrors.js';
import { verifyToken } from '../utilities/handleJwt.js';

const checkValidJwt = (req, res, next) => {
  try {
    const incomingJwt = req.headers.authorization || '';
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
