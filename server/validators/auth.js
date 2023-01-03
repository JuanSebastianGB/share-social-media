import { check } from 'express-validator';
import validateResults from '../utilities/handleValidator.js';

const validatorRegister = [
  check('firstName').exists().isLength({ min: 5, max: 30 }),
  check('lastName').exists().isLength({ min: 5, max: 30 }),
  check('email').exists().isEmail().isLength({ min: 5, max: 30 }).notEmpty(),
  check('password').exists().isLength({ min: 5, max: 15 }).isAlphanumeric(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorLogin = [
  check('email').exists().isEmail().notEmpty(),
  check('password').exists(),
  (req, res, next) => validateResults(req, res, next),
];
export { validatorRegister, validatorLogin };
