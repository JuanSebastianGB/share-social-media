import express from 'express';
import { getUserPosts } from '../controllers/posts.js';
import {
  getUser,
  getUserFriends,
  getUsers,
  toggleRelationFriend,
} from '../controllers/users.js';
import { checkValidJwt } from '../middlewares/session.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { defaultErrorFor } from '../utilities/defaultErrorFor.js';
import {
  validatorGetItem,
  validatorToggleFriend,
} from '../validators/users.js';
const router = express.Router();

router.get('/', defaultErrorFor('ERROR_GET_USERS'), asyncHandler(getUsers));

router.get('/:id', defaultErrorFor('ERROR_GET_USER'), validatorGetItem, asyncHandler(getUser));

router.get(
  '/:id/friends',
  defaultErrorFor('ERROR_GET_USERS'),
  validatorGetItem,
  asyncHandler(getUserFriends),
);
router.get('/:id/posts', validatorGetItem, getUserPosts);
router.patch(
  '/:id/:friendId',
  checkValidJwt,
  defaultErrorFor('ERROR_TOGGLE_FRIEND'),
  validatorToggleFriend,
  asyncHandler(toggleRelationFriend),
);

export default router;