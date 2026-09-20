import type { RequestHandler } from 'express';
import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorCreateItem = [
  check('name').exists().isLength({ min: 5, max: 20 }),
  check('active').exists().isBoolean(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];

const validatorGetItem = [
  check('id').exists().isMongoId(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];

export { validatorCreateItem, validatorGetItem };
