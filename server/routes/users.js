import express from 'express';
import {
  getUser,
  getUserFriends,
  getUsers,
  toggleRelationFriend,
} from '../controllers/users.js';
import {
  validatorGetItem,
  validatorToggleFriend,
} from '../validators/users.js';
const router = express.Router();

router.get('/', getUsers);
router.get('/:id', validatorGetItem, getUser);
router.get('/:id/friends', validatorGetItem, getUserFriends);
router.patch('/:id/:friendId', validatorToggleFriend, toggleRelationFriend);

export default router;
