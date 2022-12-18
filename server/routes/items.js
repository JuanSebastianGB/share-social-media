import express from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from '../controllers/items.js';
import { validatorCreateItem, validatorGetItem } from '../validators/items.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', validatorGetItem, getItem);
router.post('/', validatorCreateItem, createItem);
router.put('/:id', validatorGetItem, updateItem);
router.delete('/:id', validatorGetItem, deleteItem);

export { router as itemRouter };
