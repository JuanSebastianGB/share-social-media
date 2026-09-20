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
import uploadMiddleware from '../utilities/handleUploadFile.js';
import {
  validatorCreatePost,
  validatorGetPost,
  validatorToggleLikePost,
} from '../validators/posts.js';
import s3Upload from '../utilities/s3Upload.js';

const router = express.Router();

router.get('/', getPostsPagination);
router.get('/:id', validatorGetPost, getPost);
router.post(
  '/file',
  uploadMiddleware.single('myFile'),
  s3Upload.uploadToS3,
  checkValidJwt,
  validatorCreatePost,
  createUserPostFile,
);
router.post('/', checkValidJwt, validatorCreatePost, createUserPost);
router.put('/:id', validatorGetPost, validatorToggleLikePost, toggleLikePost);

router.delete('/:id', validatorGetPost, deletePost);
router.get('/:id/comments', validatorGetPost, getPostComments);

export default router;
