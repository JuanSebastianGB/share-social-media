import express from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem,
} from '../controllers/comments.js';
import { checkValidJwt } from '../middlewares/session.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { defaultErrorFor } from '../utilities/defaultErrorFor.js';
import { validatorCreateComment } from '../validators/comments.js';

const router = express.Router();

router.get('/', defaultErrorFor('ERROR_CREATE_COMMENT'), asyncHandler(getItems));
router.get('/:id', defaultErrorFor('ERROR_GET_COMMENT'), asyncHandler(getItem));
router.post(
  '/',
  checkValidJwt,
  defaultErrorFor('ERROR_CREATE_COMMENT'),
  validatorCreateComment,
  asyncHandler(createItem),
);
router.put(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_UPDATE_COMMENT'),
  asyncHandler(updateItem),
);
router.delete(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_DELETE_COMMENT'),
  asyncHandler(deleteItem),
);

export default router;