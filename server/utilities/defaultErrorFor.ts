import type { NextFunction, Request, Response } from 'express';

/**
 * Route-level middleware that stamps `res.locals.defaultErrorCode` so the
 * errorMapper middleware can return a route-specific fallback code when an
 * unknown error is caught. Replaces `handleHttpErrors(res, 'ERROR_X')` in
 * controllers with a declarative stamp at the route level.
 */
export const defaultErrorFor =
  (code: string) =>
  (_req: Request, res: Response, next: NextFunction): void => {
    res.locals.defaultErrorCode = code;
    next();
  };