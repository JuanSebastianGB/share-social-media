import type { NextFunction, Request, Response } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async handler so rejections flow to Express's next(err).
 * Lets controllers avoid try/catch blocks — errors are caught here and
 * routed to the central errorMapper middleware.
 */
export const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next) as Promise<void>;
  };