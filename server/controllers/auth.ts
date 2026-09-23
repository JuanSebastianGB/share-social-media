import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { HttpStatusError } from '../middlewares/error-mapper.js';
import {
  completeProfileService,
  getUserByCognitoSubService,
  registerService,
} from '../services/auth.js';
import {
  createFileUploadedRegisterService,
  deleteHardFileService,
} from '../services/storage.js';
import { getUserFromEmailService } from '../services/users.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { isCognitoAuthEnabled } from '../utilities/cognitoMode.js';
import { generateToken } from '../utilities/handleJwt.js';
import { compare, encrypt } from '../utilities/handlePassword.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  if (isCognitoAuthEnabled()) {
    throw new HttpStatusError(410, 'ERROR_USE_COGNITO_AUTH');
  }
  if (!req.file) {
    throw new HttpStatusError(403, 'ERROR_UPLOAD_FILE');
  }
  const body = matchedData(req);

  const filename =
    (req.file as Express.Multer.File & { filename?: string }).filename ||
    req.file.originalname;
  const savedFileRegister = await createFileUploadedRegisterService(
    filename,
    req.image?.secure_url,
  );

  try {
    const processedIncomingData = {
      ...body,
      password: await encrypt(body.password),
      viewedProfile: Math.floor(Math.random() * 1000),
      impressions: Math.floor(Math.random() * 1000),
      profileImageId: savedFileRegister._id || '',
    };
    const response = await registerService(processedIncomingData);
    return res.json(response);
  } catch (err) {
    await deleteHardFileService(savedFileRegister._id);
    throw err;
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  if (isCognitoAuthEnabled()) {
    throw new HttpStatusError(410, 'ERROR_USE_COGNITO_AUTH');
  }
  const body = matchedData(req);
  const { email, password } = body;
  const userFound = await getUserFromEmailService(email);
  if (!userFound) {
    throw new HttpStatusError(403, 'ERROR_USER_NOT_FOUND');
  }
  const verifiedMatch = await compare(password, userFound.password || '');
  if (!verifiedMatch) {
    throw new HttpStatusError(403, 'ERROR_PASSWORD');
  }
  userFound.password = undefined;
  const { _id, role } = userFound;
  return res.json({
    userFound,
    token: generateToken({ _id: String(_id), role: role as string | string[] }),
  });
});

/**
 * Cognito mode: authenticated multipart profile completion (avatar + fields).
 * Creates DynamoDB user without password; links cognitoSub from the access token.
 */
export const completeProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!isCognitoAuthEnabled()) {
      throw new HttpStatusError(410, 'ERROR_USE_REGISTER');
    }

    const cognitoSub = req.userData?.cognitoSub;
    if (!cognitoSub) {
      throw new HttpStatusError(401, 'ERROR_NOT_VALID_SESSION_CREDENTIALS');
    }

    if (req.userData?._id) {
      const existing = await getUserByCognitoSubService(cognitoSub);
      if (!existing) {
        throw new HttpStatusError(401, 'ERROR_PROFILE_REQUIRED');
      }
      const { password: _pw, ...safe } = existing;
      return res.json({ response: safe });
    }

    if (!req.file) throw new HttpStatusError(403, 'ERROR_UPLOAD_FILE');
    const body = matchedData(req);

    const filename =
      (req.file as Express.Multer.File & { filename?: string }).filename ||
      req.file.originalname;
    const savedFileRegister = await createFileUploadedRegisterService(
      filename,
      req.image?.secure_url,
    );

    try {
      const processedIncomingData = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        location: body.location,
        occupation: body.occupation,
        viewedProfile: Math.floor(Math.random() * 1000),
        impressions: Math.floor(Math.random() * 1000),
        profileImageId: savedFileRegister._id || '',
      };
      const result = await completeProfileService(
        cognitoSub,
        processedIncomingData,
      );
      return res
        .status(result.created ? 201 : 200)
        .json({ response: result.response });
    } catch (err) {
      await deleteHardFileService(savedFileRegister._id);
      throw err;
    }
  },
);