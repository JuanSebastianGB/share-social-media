import express from 'express';
import {
  createUserPost,
  createUserPostFile,
  deletePost,
  getPost,
  getPostComments,
  getPostsPagination,
  // getPosts,
  toggleLikePost,
} from '../controllers/posts.js';
import { checkValidJwt } from '../middlewares/session.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import {
  validatorCreatePost,
  validatorGetPost,
  validatorToggleLikePost,
} from '../validators/posts.js';
import cloudUpload from '../utilities/cloudinary.js';

const router = express.Router();

// router.get('/', getPosts);
router.get('/', getPostsPagination);
router.get('/:id', validatorGetPost, getPost);
router.post(
  '/file',
  uploadMiddleware.single('myFile'),
  cloudUpload.uploadToCloud,
  checkValidJwt,
  validatorCreatePost,
  createUserPostFile
);
router.post('/', checkValidJwt, validatorCreatePost, createUserPost);
router.put('/:id', validatorGetPost, validatorToggleLikePost, toggleLikePost);

router.delete('/:id', validatorGetPost, deletePost);
router.get('/:id/comments', validatorGetPost, getPostComments);

export default router;
