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

/**
 * Get users
 * @openapi
 * /users:
 *    get:
 *      tags:
 *        - users
 *      summary: Users list
 *      description: To list all users.
 *      responses:
 *        '200':
 *          description: Successful operation.
 *        '401':
 *          description: Unauthorized.
 *        '422':
 *          description: Validation Error.
 *      security:
 *        - bearerAuth: []
 */
router.get('/', getUsers);

/**
 * Get User
 * @openapi
 * /users/{id}:
 *    get:
 *      tags:
 *        - users
 *      parameters:
 *        - name: id
 *          in: path
 *          description: User id
 *          required: true
 *          schema:
 *            type: string
 *      summary: User detail
 *      description: To get a single user.
 *      responses:
 *        '200':
 *          description: Successful operation.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 *        '401':
 *          description: Unauthorized.
 *        '422':
 *          description: Validation Error.
 *      security:
 *        - bearerAuth: []
 */
router.get('/:id', validatorGetItem, getUser);

/**
 * Get User
 * @openapi
 * /users/{id}/friends:
 *    get:
 *      tags:
 *        - users
 *      parameters:
 *        - name: id
 *          in: path
 *          description: User id
 *          required: true
 *          schema:
 *            type: string
 *      summary: get all friends from user
 *      description: To get a list of user's friends.
 *      responses:
 *        '200':
 *          description: Successful operation.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 *        '401':
 *          description: Unauthorized.
 *        '422':
 *          description: Validation Error.
 *      security:
 *        - bearerAuth: []
 */
router.get('/:id/friends', validatorGetItem, getUserFriends);
router.patch('/:id/:friendId', validatorToggleFriend, toggleRelationFriend);

export default router;
