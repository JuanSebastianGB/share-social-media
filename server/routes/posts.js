import express from 'express';
import {
  createUserPost,
  deletePost,
  getPost,
  getPosts,
  toggleLikePost,
} from '../controllers/posts.js';
import { checkValidJwt } from '../middlewares/session.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import {
  validatorCreatePost,
  validatorGetPost,
  validatorToggleLikePost,
} from '../validators/posts.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', validatorGetPost, getPost);
router.post(
  '/',
  uploadMiddleware.single('myFile'),
  checkValidJwt,
  validatorCreatePost,
  createUserPost
);
router.put('/:id', validatorGetPost, validatorToggleLikePost, toggleLikePost);

router.delete('/:id', validatorGetPost, deletePost);

export default router;
