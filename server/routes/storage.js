import express from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
} from '../controllers/storage.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import { validatorGetItem } from '../validators/storage.js';
const router = express.Router();

router.get('/', getItems);
router.get('/:id', validatorGetItem, getItem);
router.post('/', uploadMiddleware.single('myFile'), createItem);
router.delete('/:id', validatorGetItem, deleteItem);

export default router;
