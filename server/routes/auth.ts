import express, { type RequestHandler } from 'express';
import { completeProfile, login, register } from '../controllers/auth.js';
import { checkAuthToken } from '../middlewares/session.js';
import { getUserByCognitoSubService } from '../services/auth.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { isCognitoAuthEnabled } from '../utilities/cognitoMode.js';
import { defaultErrorFor } from '../utilities/defaultErrorFor.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import s3Upload from '../utilities/s3Upload.js';
import {
  validatorLogin,
  validatorProfile,
  validatorRegister,
} from '../validators/auth.js';

const router = express.Router();

/**
 * When the Cognito caller already has a DynamoDB profile, return it before
 * multer/validators (login path: empty body + Bearer access token).
 */
const returnExistingCognitoProfile: RequestHandler = async (req, res, next) => {
  if (!isCognitoAuthEnabled()) return next();
  const cognitoSub = req.userData?.cognitoSub;
  if (!cognitoSub || !req.userData?._id) return next();

  const existing = await getUserByCognitoSubService(cognitoSub);
  if (!existing) return next();

  const { password: _pw, ...safe } = existing;
  return res.json({ response: safe });
};

router.post(
  '/register',
  defaultErrorFor('ERROR_REGISTER'),
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  validatorRegister,
  asyncHandler(register),
);
router.post(
  '/login',
  defaultErrorFor('ERROR_LOGIN'),
  validatorLogin,
  asyncHandler(login),
);

router.post(
  '/profile',
  checkAuthToken,
  returnExistingCognitoProfile,
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  defaultErrorFor('ERROR_COMPLETE_PROFILE'),
  validatorProfile,
  asyncHandler(completeProfile),
);

export default router;