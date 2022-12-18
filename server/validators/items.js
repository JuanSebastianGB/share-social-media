import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorCreateItem = [
  check('name').exists().isLength({ min: 5, max: 20 }),
  check('active').exists().isBoolean(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorGetItem = [
  check('id').exists().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

export { validatorCreateItem, validatorGetItem };
