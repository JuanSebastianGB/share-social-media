import express from 'express';
import { login, register } from '../controllers/auth.js';
import s3Upload from '../utilities/s3Upload.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import { validatorLogin, validatorRegister } from '../validators/auth.js';

const router = express.Router();

router.post(
  '/register',
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  validatorRegister,
  register,
);
router.post('/login', validatorLogin, login);

export default router;
