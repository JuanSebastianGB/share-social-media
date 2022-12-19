import express from 'express';
import { getItem, getItems } from '../controllers/users.js';
import { validatorGetItem } from '../validators/users.js';
const router = express.Router();

router.get('/', getItems);
router.get('/:id', validatorGetItem, getItem);

export default router;
