import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorRegister = [
  check('firstName').exists().isLength({ min: 5, max: 30 }).isAlphanumeric(),
  check('lastName').exists().isLength({ min: 5, max: 30 }).isAlphanumeric(),
  check('email').exists().isEmail().isLength({ min: 5, max: 30 }).notEmpty(),
  check('password').exists().isLength({ min: 5, max: 15 }).isAlphanumeric(),
  check('age').isNumeric(),
  check('picturePath').exists().notEmpty(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorLogin = [
  check('email').exists().isEmail().notEmpty(),
  check('password').exists(),
  (req, res, next) => validateResults(req, res, next),
];
export { validatorRegister, validatorLogin };
