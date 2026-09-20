import express from 'express';
import { completeProfile, login, register } from '../controllers/auth.js';
import { checkAuthToken } from '../middlewares/session.js';
import s3Upload from '../utilities/s3Upload.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import {
  validatorLogin,
  validatorProfile,
  validatorRegister,
} from '../validators/auth.js';

const router = express.Router();

router.post(
  '/register',
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  validatorRegister,
  register,
);
router.post('/login', validatorLogin, login);

router.post(
  '/profile',
  checkAuthToken,
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  validatorProfile,
  completeProfile,
);

export default router;
