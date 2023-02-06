import express from 'express';
import { login, register } from '../controllers/auth.js';
import cloudUpload from '../utilities/cloudinary.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import { validatorLogin, validatorRegister } from '../validators/auth.js';

const router = express.Router();

router.post(
  '/register',
  uploadMiddleware.single('myFile'),
  cloudUpload.uploadToCloud,
  validatorRegister,
  register
);
router.post('/login', validatorLogin, login);

export default router;
