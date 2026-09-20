import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import { registerService } from '../services/auth.js';
import {
  createFileUploadedRegisterService,
  deleteHardFileService,
} from '../services/storage.js';
import { getUserFromEmailService } from '../services/users.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';
import { generateToken } from '../utilities/handleJwt.js';
import { compare, encrypt } from '../utilities/handlePassword.js';

const register: RequestHandler = async (req, res) => {
  if (!req.file) return handleHttpErrors(res, 'ERROR_UPLOAD_FILE');
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
  } catch {
    await deleteHardFileService(savedFileRegister._id);
    handleHttpErrors(res, 'ERROR_REGISTER');
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const body = matchedData(req);
    const { email, password } = body;
    const userFound = await getUserFromEmailService(email);
    if (!userFound) return handleHttpErrors(res, 'ERROR_USER_NOT_FOUND');
    const verifiedMatch = await compare(password, userFound.password || '');
    if (!verifiedMatch) return handleHttpErrors(res, 'ERROR_PASSWORD');
    userFound.password = undefined;
    const { _id, role } = userFound;
    return res.json({
      userFound,
      token: generateToken({ _id: String(_id), role: role as string | string[] }),
    });
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_LOGIN');
  }
};

export { register, login };
