import express from 'express';
import {
  createFileUploadedRegister,
  deleteFile,
  getFile,
  getFiles,
} from '../controllers/storage.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import { validatorGetItem } from '../validators/storage.js';
const router = express.Router();

router.get('/', getFiles);
router.get('/:id', validatorGetItem, getFile);
router.post('/', uploadMiddleware.single('myFile'), createFileUploadedRegister);
router.delete('/:id', validatorGetItem, deleteFile);

export default router;
