import type { RequestHandler } from 'express';
import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorCreatePost = [
  check('body').not().isEmpty().exists().isString(),
  check('type').isString(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];

const validatorGetPost = [
  check('id', 'Must be a valid mongo ID').not().isEmpty().isMongoId(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];

export { validatorCreatePost, validatorGetPost };
