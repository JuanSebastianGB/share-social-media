import express from 'express';
import {
  createUserPost,
  createUserPostFile,
  deletePost,
  getPost,
  getPostComments,
  getPostsPagination,
  toggleLikePost,
} from '../controllers/posts.js';
import { checkValidJwt } from '../middlewares/session.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { defaultErrorFor } from '../utilities/defaultErrorFor.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import {
  validatorCreatePost,
  validatorGetPost,
} from '../validators/posts.js';
import s3Upload from '../utilities/s3Upload.js';

const router = express.Router();

router.get('/', defaultErrorFor('ERROR_GET_POSTS'), asyncHandler(getPostsPagination));
router.get('/:id', defaultErrorFor('ERROR_GET_POST'), validatorGetPost, asyncHandler(getPost));
router.post(
  '/file',
  checkValidJwt,
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  defaultErrorFor('ERROR_CREATE_POST'),
  validatorCreatePost,
  asyncHandler(createUserPostFile),
);
router.post(
  '/',
  checkValidJwt,
  defaultErrorFor('ERROR_CREATE_POST'),
  validatorCreatePost,
  asyncHandler(createUserPost),
);
router.put(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_TOGGLE_LIKE_POST'),
  validatorGetPost,
  asyncHandler(toggleLikePost),
);

router.delete(
  '/:id',
  checkValidJwt,
  defaultErrorFor('ERROR_DELETE_POST'),
  validatorGetPost,
  asyncHandler(deletePost),
);
router.get(
  '/:id/comments',
  defaultErrorFor('ERROR_GET_POST_COMMENTS'),
  validatorGetPost,
  asyncHandler(getPostComments),
);

export default router;