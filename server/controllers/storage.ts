import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import {
  createDefaultService,
  createFileUploadedRegisterService,
  deleteSoftFileService,
  getFileService,
  getFilesService,
} from '../services/storage.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

export const getFiles = asyncHandler(async (_req: Request, res: Response) => {
  const files = await getFilesService();
  return res.json(files);
});

export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  const file = await getFileService(id);
  return res.json(file);
});

export const createFileUploadedRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const filename =
      (req.file as Express.Multer.File & { filename?: string })?.filename ||
      req.file?.originalname ||
      '';
    const response = await createFileUploadedRegisterService(
      filename,
      undefined,
      req.userData!._id,
    );
    return res.json(response);
  },
);

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  const response = await deleteSoftFileService(id, req.userData!._id);
  return res.json(response);
});

export const createDefault = asyncHandler(async (_req: Request, res: Response) => {
  const creationDefault = await createDefaultService();
  res.json(creationDefault);
});