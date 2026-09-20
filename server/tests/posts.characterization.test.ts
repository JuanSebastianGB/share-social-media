import request from 'supertest';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Posts characterization', () => {
  describe('GET /posts', () => {
    test('returns 200 array without JWT (paginated list)', async () => {
      const response = await request(app).get('/posts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /posts (JSON path — no multipart upload)', () => {
    test('returns 401 without Bearer token', async () => {
      const response = await request(app).post('/posts').send({
        body: 'hello world',
        type: 'text',
        userId: '507f1f77bcf86cd799439011',
      });

      expect(response.status).toBe(401);
      expect(response.body).toBe('ERROR_EXPECTED_BEARER');
    });

    test('returns 200 post shape when authenticated', async () => {
      const user = await registerUser();
      const response = await request(app)
        .post('/posts')
        .set(authHeader(user.token))
        .send({
          body: 'characterization post body',
          type: 'text',
          userId: user.userId,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          body: 'characterization post body',
          type: 'text',
          likes: expect.any(Object),
          comments: expect.any(Array),
          file: expect.objectContaining({
            _id: expect.any(String),
            url: expect.any(String),
          }),
          user: expect.objectContaining({
            _id: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
          }),
        }),
      );
    });
  });

  describe('GET /posts/:id', () => {
    test('returns 200 post without JWT', async () => {
      const user = await registerUser();
      const created = await request(app)
        .post('/posts')
        .set(authHeader(user.token))
        .send({
          body: 'fetch me',
          type: 'text',
          userId: user.userId,
        });

      const response = await request(app).get(`/posts/${created.body._id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          _id: created.body._id,
          body: 'fetch me',
        }),
      );
    });

    test('returns 403 for invalid id', async () => {
      const response = await request(app).get('/posts/bad-id');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /posts/:id (like — no JWT)', () => {
    test('returns 200 liked post document', async () => {
      const author = await registerUser();
      const liker = await registerUser({ firstName: 'Liker' });
      const created = await request(app)
        .post('/posts')
        .set(authHeader(author.token))
        .send({
          body: 'like me',
          type: 'text',
          userId: author.userId,
        });

      const response = await request(app)
        .put(`/posts/${created.body._id}`)
        .send({ userId: liker.userId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: created.body._id,
          likes: expect.any(Object),
        }),
      );
      expect(response.body.likes[liker.userId]).toBe(true);
    });
  });

  describe('GET /posts/:id/comments (no JWT)', () => {
    test('returns 200 array of comments', async () => {
      const user = await registerUser();
      const created = await request(app)
        .post('/posts')
        .set(authHeader(user.token))
        .send({
          body: 'has comments',
          type: 'text',
          userId: user.userId,
        });

      expect(created.status).toBe(200);
      expect(created.body._id).toBeDefined();

      const response = await request(app).get(
        `/posts/${created.body._id}/comments`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /posts/:id (no JWT)', () => {
    test('returns 200 delete result', async () => {
      const user = await registerUser();
      const created = await request(app)
        .post('/posts')
        .set(authHeader(user.token))
        .send({
          body: 'delete me',
          type: 'text',
          userId: user.userId,
        });

      const response = await request(app).delete(`/posts/${created.body._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          acknowledged: true,
          deletedCount: 1,
        }),
      );
    });
  });
});
