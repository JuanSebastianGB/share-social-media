import express from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from '../controllers/items.js';
import { cache, role } from '../middlewares/index.js';
import { checkValidJwt } from '../middlewares/session.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { defaultErrorFor } from '../utilities/defaultErrorFor.js';
import { validatorCreateItem, validatorGetItem } from '../validators/items.js';

const router = express.Router();

router.get('/', cache, defaultErrorFor('ERROR_CREATE_ITEM'), asyncHandler(getItems));
router.get(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_GET_ITEM'),
  validatorGetItem,
  asyncHandler(getItem),
);
router.post(
  '/',
  checkValidJwt,
  role(['admin']),
  defaultErrorFor('ERROR_CREATE_ITEM'),
  validatorCreateItem,
  asyncHandler(createItem),
);
router.put(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_UPDATE_ITEM'),
  validatorGetItem,
  asyncHandler(updateItem),
);
router.delete(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_DELETE_ITEM'),
  validatorGetItem,
  asyncHandler(deleteItem),
);

export default router;