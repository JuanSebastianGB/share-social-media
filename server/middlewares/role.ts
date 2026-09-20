import type { NextFunction, Request, Response } from 'express';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

/**
 * It checks if the user's role is included in the array of roles passed to the function
 */
const checkRol =
  (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.userData?.role;
      const rolesList = Array.isArray(userRoles)
        ? userRoles
        : userRoles
          ? [userRoles]
          : [];
      const isMatchData = roles.some((singleRole) =>
        rolesList.includes(singleRole),
      );
      if (isMatchData) return next();
      handleHttpErrors(res, 'ERROR_NOT_AUTHORIZED', 403);
    } catch (error) {
      console.log(error);
      handleHttpErrors(res, 'ERROR_CREDENTIALS', 403);
    }
  };

export default checkRol;
