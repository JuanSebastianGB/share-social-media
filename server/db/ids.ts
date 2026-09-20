import { randomBytes } from 'crypto';

/** 24-char hex string compatible with express-validator `isMongoId()`. */
export function generateId(): string {
  return randomBytes(12).toString('hex');
}
