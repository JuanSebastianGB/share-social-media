import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

/**
 * It checks if the user's role is included in the array of roles passed to the function
 * @param roles - an array of roles that the user must have to access the route.
 * @returns a function.
 */
const checkRol = (roles) => (req, res, next) => {
  try {
    const userRoles = req.userData.role;
    const isMatchData = roles.some((singleRole) =>
      userRoles.includes(singleRole)
    );
    if (isMatchData) return next();
    handleHttpErrors(res, 'ERROR_NOT_AUTHORIZED', 403);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_CREDENTIALS', 403);
  }
};

export default checkRol;
