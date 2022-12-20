import express from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from '../controllers/items.js';
import { checkValidJwt } from '../middlewares/session.js';
import { validatorCreateItem, validatorGetItem } from '../validators/items.js';

const router = express.Router();

router.get('/', checkValidJwt, getItems);
router.get('/:id', checkValidJwt, validatorGetItem, getItem);
router.post('/', checkValidJwt, validatorCreateItem, createItem);
router.put('/:id', checkValidJwt, validatorGetItem, updateItem);
router.delete('/:id', checkValidJwt, validatorGetItem, deleteItem);

export default router;
