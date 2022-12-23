import express from 'express';
import { getUser, getUserFriends, getUsers } from '../controllers/users.js';
import { validatorGetItem } from '../validators/users.js';
const router = express.Router();

router.get('/', getUsers);
router.get('/:id', validatorGetItem, getUser);
router.get('/:id/friends', validatorGetItem, getUserFriends);

export default router;
