import express from 'express';
import { getUserPosts } from '../controllers/posts.js';
import {
  getUser,
  getUserFriends,
  getUsers,
  toggleRelationFriend,
} from '../controllers/users.js';
import { checkValidJwt } from '../middlewares/session.js';
import {
  validatorGetItem,
  validatorToggleFriend,
} from '../validators/users.js';
const router = express.Router();

router.get('/', getUsers);

router.get('/:id', validatorGetItem, getUser);

router.get('/:id/friends', validatorGetItem, getUserFriends);
router.get('/:id/posts', validatorGetItem, getUserPosts);
router.patch(
  '/:id/:friendId',
  checkValidJwt,
  validatorToggleFriend,
  toggleRelationFriend,
);

export default router;
