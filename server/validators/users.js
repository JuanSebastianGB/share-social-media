import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorGetItem = [
  check('id', 'Must be a valid mongo ID').exists().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorToggleFriend = [
  check('id').exists().isMongoId(),
  check('friendId').exists().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

export { validatorGetItem, validatorToggleFriend };
