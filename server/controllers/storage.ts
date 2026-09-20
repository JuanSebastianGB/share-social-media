import type { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import {
  createDefaultService,
  createFileUploadedRegisterService,
  deleteSoftFileService,
  getFileService,
  getFilesService,
} from '../services/storage.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

const getFiles: RequestHandler = async (_req, res) => {
  try {
    const files = await getFilesService();
    return res.json(files);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_FILES');
  }
};

const getFile: RequestHandler = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const file = await getFileService(id);
    return res.json(file);
  } catch {
    handleHttpErrors(res, 'ERROR_GET_FILE');
  }
};

const createFileUploadedRegister: RequestHandler = async (req, res) => {
  try {
    const filename =
      (req.file as Express.Multer.File & { filename?: string })?.filename ||
      req.file?.originalname ||
      '';
    const response = await createFileUploadedRegisterService(filename);
    return res.json(response);
  } catch (error) {
    console.log(
      '🚀 ~ file: storage.ts:37 ~ createFileUploadedRegister ~ error',
      error,
    );
    handleHttpErrors(res, 'ERROR_UPLOAD_FILE');
  }
};

const deleteFile: RequestHandler = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const response = await deleteSoftFileService(id);
    return res.json(response);
  } catch {
    handleHttpErrors(res, 'ERROR_DELETE_FILE');
  }
};

const createDefault: RequestHandler = async (_req, res) => {
  const creationDefault = await createDefaultService();
  res.json(creationDefault);
};

export {
  getFiles,
  createFileUploadedRegister,
  getFile,
  deleteFile,
  createDefault,
};
