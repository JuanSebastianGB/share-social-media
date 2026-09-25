import type { ErrorRequestHandler } from 'express';
import { InvalidCatalogItemError } from '../modules/catalog/domain/errors.js';
import { InvalidCommentError } from '../modules/comments/domain/errors.js';
import { InvalidPostError } from '../modules/feed/domain/errors.js';
import { InvalidUserError } from '../modules/identity/domain/errors.js';
import { InvalidMediaFileError } from '../modules/media/domain/errors.js';
import {
  ERROR_NOT_RESOURCE_OWNER,
  NotResourceOwnerError,
} from '../modules/shared/not-resource-owner-error.js';
import { InvalidFriendListError, UserOrFriendNotFoundError } from '../modules/social/domain/errors.js';

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
 * Carries an explicit HTTP status + body code. Use this when a middleware or
 * controller needs to return a non-400/500 status (e.g. 401, 404, 410) without
 * bypassing the central error mapping.
 */
export class HttpStatusError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = 'HttpStatusError';
  }
}

/**
 * Central Express error middleware.
 *
 * Precedence:
 * 1. HttpStatusError         → its own status + body (highest priority — explicit intent).
 * 2. NotResourceOwnerError   → 403 + `ERROR_NOT_RESOURCE_OWNER` (not the route code).
 * 3. UserOrFriendNotFoundError → 404 + route's `res.locals.defaultErrorCode` (or FALLBACK_BODY).
 * 4. Domain errors           → 400 + route's `res.locals.defaultErrorCode` (or FALLBACK_BODY).
 * 5. Unknown errors          → 500 + route's `res.locals.defaultErrorCode` (or FALLBACK_BODY) + console.error.
 *
 * Replaces the legacy `handleHttpErrors` utility and 53 scattered try/catch sites.
 */
export const errorMapper: ErrorRequestHandler = (err, _req, res, _next) => {
  const code = res.locals.defaultErrorCode ?? FALLBACK_BODY;
  if (err instanceof HttpStatusError) {
    return res.status(err.status).json(err.code);
  }
  if (err instanceof NotResourceOwnerError) {
    return res.status(403).json(ERROR_NOT_RESOURCE_OWNER);
  }
  if (err instanceof UserOrFriendNotFoundError) {
    return res.status(404).json(code);
  }
  if (DOMAIN_ERRORS.some((E) => err instanceof E)) {
    return res.status(400).json(code);
  }
  console.error('[unhandled]', err);
  return res.status(500).json(code);
};