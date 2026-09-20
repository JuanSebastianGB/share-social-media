import express from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from '../controllers/comments.js';
import { checkValidJwt } from '../middlewares/session.js';
import { validatorCreateComment } from '../validators/comments.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', checkValidJwt, validatorCreateComment, createItem);
router.put('/:id', checkValidJwt, updateItem);
router.delete('/:id', checkValidJwt, deleteItem);

export default router;
