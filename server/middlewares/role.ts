import type { NextFunction, Request, Response } from 'express';
import { HttpStatusError } from './error-mapper.js';

/**
 * It checks if the user's role is included in the array of roles passed to the function
 */
const checkRol =
  (roles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
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
      return next(new HttpStatusError(403, 'ERROR_NOT_AUTHORIZED'));
    } catch {
      return next(new HttpStatusError(403, 'ERROR_CREDENTIALS'));
    }
  };

export default checkRol;