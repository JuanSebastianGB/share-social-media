export const ERROR_NOT_RESOURCE_OWNER = 'ERROR_NOT_RESOURCE_OWNER';

/**
 * Thrown when an authenticated caller mutates a resource they do not own.
 * Mapped to HTTP 403 with body `ERROR_NOT_RESOURCE_OWNER`.
 */
export class NotResourceOwnerError extends Error {
  constructor() {
    super(ERROR_NOT_RESOURCE_OWNER);
    this.name = 'NotResourceOwnerError';
  }
}
