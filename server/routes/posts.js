import express from 'express';
import {
  createUserPost,
  deletePost,
  getPost,
  getPosts,
} from '../controllers/posts.js';
import uploadMiddleware from '../utilities/handleUploadFile.js';
import { validatorCreatePost, validatorGetPost } from '../validators/posts.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', validatorGetPost, getPost);
router.post(
  '/',
  uploadMiddleware.single('myFile'),
  validatorCreatePost,
  createUserPost
);

router.delete('/:id', validatorGetPost, deletePost);

export default router;
