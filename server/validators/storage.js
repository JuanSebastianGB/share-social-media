import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorGetItem = [
  check('id').exists().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

export { validatorGetItem };
