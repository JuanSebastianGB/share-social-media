import express from 'express';
import { login, register } from '../controllers/auth.js';
import { validatorLogin, validatorRegister } from '../validators/auth.js';
const router = express.Router();

router.post('/register', validatorRegister, register);
router.post('/login', validatorLogin, login);

export default router;
