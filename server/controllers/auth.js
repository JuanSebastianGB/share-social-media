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

/**
 * It takes the incoming data, encrypts the password, and then creates a new user.
 * @param req - The request object
 * @param res - the response object
 * @returns The response is being returned.
 */
const register = async (req, res) => {
  if (!req.file) return handleHttpErrors(res, 'ERROR_UPLOAD_FILE');
  const body = matchedData(req);

  const {
    file: { filename },
  } = req;
  const savedFileRegister = await createFileUploadedRegisterService(
    filename,
    req.image.secure_url
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
  } catch (error) {
    await deleteHardFileService(savedFileRegister._id);
    handleHttpErrors(res, 'ERROR_REGISTER');
  }
};

/**
 * It takes in a request and a response, and then it tries to find a user with the email provided in
 * the request body. If it finds a user, it then compares the password provided in the request body
 * with the password stored in the database. If the passwords match, it returns the user object. If the
 * passwords don't match, it returns an error. If it doesn't find a user, it returns an error.
 * @param req - The request object
 * @param res - the response object
 * @returns The userFound object is being returned.
 */
const login = async (req, res) => {
  try {
    const body = matchedData(req);
    const { email, password } = body;
    const userFound = await getUserFromEmailService(email);
    if (!userFound) return handleHttpErrors(res, 'ERROR_USER_NOT_FOUND');
    const verifiedMatch = await compare(password, userFound.password);
    if (!verifiedMatch) return handleHttpErrors(res, 'ERROR_PASSWORD');
    userFound.password = undefined;
    const { _id, role } = userFound;
    return res.json({ userFound, token: generateToken({ _id, role }) });
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_LOGIN');
  }
};

export { register, login };
