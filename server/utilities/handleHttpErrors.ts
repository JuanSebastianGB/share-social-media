import type { Response } from 'express';

/**
 * If the response is not OK, then send a message to the client with the status code.
 */
const handleHttpErrors = (
  res: Response,
  message = 'Something went wrong',
  code = 403,
) => res.status(code).json(message);

export { handleHttpErrors };
