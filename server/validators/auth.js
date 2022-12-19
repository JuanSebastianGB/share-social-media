import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorRegister = [
  check('name').exists().isLength({ min: 5, max: 20 }).isAlphanumeric(),
  check('email').exists().isEmail().isLength({ min: 5, max: 30 }),
  check('password').exists().isLength({ min: 5, max: 15 }).isAlphanumeric(),
  (req, res, next) => validateResults(req, res, next),
  check('age').isNumeric(),
];

const validatorLogin = [
  check('email').exists().isEmail(),
  check('password').exists(),
  (req, res, next) => validateResults(req, res, next),
];
export { validatorRegister, validatorLogin };
