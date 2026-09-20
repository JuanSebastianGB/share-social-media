import type { RequestHandler } from 'express';
import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorGetItem = [
  check('id').exists().isMongoId(),
  ((req, res, next) => validateResults(req, res, next)) as RequestHandler,
];

export { validatorGetItem };
