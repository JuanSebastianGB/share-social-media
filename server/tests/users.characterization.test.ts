import request from 'supertest';
import { app } from './testApp.js';
import { registerUser } from './helpers.js';

describe('Users characterization', () => {
  describe('GET /users/:id', () => {
    test('returns 200 user detail without JWT (no session middleware)', async () => {
      const user = await registerUser();
      const response = await request(app).get(`/users/${user.userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      );
    });

    test('returns 403 validation errors for non-ObjectId id', async () => {
      const response = await request(app).get('/users/not-a-mongo-id');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /users/:id/friends', () => {
    test('returns 200 array (empty for new user) without JWT', async () => {
      const user = await registerUser();
      const response = await request(app).get(`/users/${user.userId}/friends`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('PATCH /users/:id/:friendId', () => {
    test('returns 200 friends list after toggling friendship (no JWT)', async () => {
      const a = await registerUser({ firstName: 'Alice' });
      const b = await registerUser({ firstName: 'Bobby' });

      const response = await request(app).patch(
        `/users/${a.userId}/${b.userId}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          _id: b.userId,
        }),
      );
    });

    test('returns ERROR_TOGGLE_FRIEND (404) when friend does not exist', async () => {
      const a = await registerUser();
      const fakeFriendId = '507f1f77bcf86cd799439011';

      const response = await request(app).patch(
        `/users/${a.userId}/${fakeFriendId}`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toBe('ERROR_TOGGLE_FRIEND');
    });
  });
});
