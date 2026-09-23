import type { ErrorRequestHandler } from 'express';
import { InvalidCatalogItemError } from '../modules/catalog/domain/errors.js';
import { InvalidCommentError } from '../modules/comments/domain/errors.js';
import { InvalidPostError } from '../modules/feed/domain/errors.js';
import { InvalidUserError } from '../modules/identity/domain/errors.js';
import { InvalidMediaFileError } from '../modules/media/domain/errors.js';
import { InvalidFriendListError } from '../modules/social/domain/errors.js';

const DOMAIN_ERRORS = [
  InvalidPostError,
  InvalidUserError,
  InvalidMediaFileError,
  InvalidFriendListError,
  InvalidCommentError,
  InvalidCatalogItemError,
] as const;

const FALLBACK_BODY = 'Something went wrong';

/**
 * Central Express error middleware.
 *
 * - Domain errors → 400 + route's `res.locals.defaultErrorCode` (or FALLBACK_BODY).
 * - Unknown errors → 500 + route's `res.locals.defaultErrorCode` (or FALLBACK_BODY) + console.error.
 *
 * Routes stamp the default via the `defaultErrorFor(code)` middleware.
 * Replaces the legacy `handleHttpErrors` utility and 53 scattered try/catch sites.
 */
export const errorMapper: ErrorRequestHandler = (err, _req, res, _next) => {
  const code = res.locals.defaultErrorCode ?? FALLBACK_BODY;
  if (DOMAIN_ERRORS.some((E) => err instanceof E)) {
    return res.status(400).json(code);
  }
  console.error('[unhandled]', err);
  return res.status(500).json(code);
};