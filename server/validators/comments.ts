import type { RequestHandler } from 'express';
import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

export const validatorCreateComment = [
  check('postId').exists().isMongoId(),
  check('firstName').exists().isString(),
  check('lastName').exists().isString(),
  check('description').exists().isString(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];

export const validatorGetComment = [
  check('id').exists().isMongoId(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];
