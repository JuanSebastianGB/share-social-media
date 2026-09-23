import type { NextFunction, Request, Response } from 'express';
import { getUserByCognitoSubService } from '../services/auth.js';
import { isCognitoAuthEnabled } from '../utilities/cognitoMode.js';
import { verifyToken } from '../utilities/handleJwt.js';
import { HttpStatusError } from './error-mapper.js';

type SessionOptions = {
  /** When true (default), Cognito users must already have a DynamoDB profile. */
  requireProfile?: boolean;
};

async function runSessionCheck(
  req: Request,
  _res: Response,
  next: NextFunction,
  options: SessionOptions,
) {
  try {
    const incomingJwt = req.headers.authorization || '';
    if (incomingJwt.split(' ')[0] !== 'Bearer')
      return next(new HttpStatusError(401, 'ERROR_EXPECTED_BEARER'));
    const token = incomingJwt.split(' ').pop() as string;
    const claims = await verifyToken(token);
    if (!claims)
      return next(
        new HttpStatusError(401, 'ERROR_NOT_VALID_SESSION_CREDENTIALS'),
      );

    if (isCognitoAuthEnabled() && claims.cognitoSub) {
      const user = await getUserByCognitoSubService(claims.cognitoSub);
      if (!user) {
        if (options.requireProfile !== false) {
          return next(new HttpStatusError(401, 'ERROR_PROFILE_REQUIRED'));
        }
        req.userData = {
          _id: '',
          role: 'user',
          cognitoSub: claims.cognitoSub,
        };
        return next();
      }
      req.userData = {
        _id: user._id,
        role: user.role,
        cognitoSub: claims.cognitoSub,
      };
      return next();
    }

    req.userData = claims;
    next();
  } catch (err) {
    next(new HttpStatusError(500, 'ERROR_SESSION'));
    void err;
  }
}

/**
 * Requires a valid Bearer token and a resolved app user (`req.userData._id`).
 */
const checkValidJwt = (req: Request, res: Response, next: NextFunction) =>
  void runSessionCheck(req, res, next, { requireProfile: true });

/**
 * Verifies Bearer token but allows Cognito callers without a DynamoDB profile yet
 * (used by POST /auth/profile).
 */
const checkAuthToken = (req: Request, res: Response, next: NextFunction) =>
  void runSessionCheck(req, res, next, { requireProfile: false });

export { checkValidJwt, checkAuthToken };