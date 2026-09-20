import request from 'supertest';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Comments characterization', () => {
  async function createPostForUser() {
    const user = await registerUser();
    const created = await request(app)
      .post('/posts')
      .set(authHeader(user.token))
      .send({
        body: 'post for comments',
        type: 'text',
      });
    return { user, postId: created.body._id as string };
  }

  async function createComment(
    user: Awaited<ReturnType<typeof registerUser>>,
    postId: string,
    description: string,
  ) {
    return request(app)
      .post('/comments')
      .set(authHeader(user.token))
      .send({
        postId,
        firstName: user.firstName,
        lastName: user.lastName,
        description,
      });
  }

  describe('GET /comments', () => {
    test('returns 200 array without JWT', async () => {
      const response = await request(app).get('/comments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /comments', () => {
    test('returns 401 without Bearer token', async () => {
      const response = await request(app).post('/comments').send({
        postId: '507f1f77bcf86cd799439011',
        firstName: 'A',
        lastName: 'B',
        description: 'nice post',
      });

      expect(response.status).toBe(401);
      expect(response.body).toBe('ERROR_EXPECTED_BEARER');
    });

    test('returns 200 updated post when authenticated', async () => {
      const { user, postId } = await createPostForUser();

      const response = await createComment(user, postId, 'nice post');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: postId,
          comments: expect.any(Array),
        }),
      );
      expect(response.body.comments.length).toBeGreaterThanOrEqual(1);
    });

    test('returns 403 validation errors when body is incomplete', async () => {
      const user = await registerUser();
      const response = await request(app)
        .post('/comments')
        .set(authHeader(user.token))
        .send({});

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /comments/:id (no JWT)', () => {
    test('returns 200 comment document', async () => {
      const { user, postId } = await createPostForUser();
      await createComment(user, postId, 'fetchable');

      const list = await request(app).get('/comments');
      const comment = list.body.find(
        (c: { description?: string }) => c.description === 'fetchable',
      );
      expect(comment).toBeDefined();

      const response = await request(app).get(`/comments/${comment._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: comment._id,
          description: 'fetchable',
        }),
      );
    });
  });

  describe('PUT /comments/:id', () => {
    test('returns 401 without Bearer token', async () => {
      const response = await request(app)
        .put('/comments/507f1f77bcf86cd799439011')
        .send({ description: 'updated text' });

      expect(response.status).toBe(401);
      expect(response.body).toBe('ERROR_EXPECTED_BEARER');
    });

    test('returns 200 update result when authenticated', async () => {
      const { user, postId } = await createPostForUser();
      await createComment(user, postId, 'to update');

      const list = await request(app).get('/comments');
      const comment = list.body.find(
        (c: { description?: string }) => c.description === 'to update',
      );

      const response = await request(app)
        .put(`/comments/${comment._id}`)
        .set(authHeader(user.token))
        .send({ description: 'updated text' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          acknowledged: true,
          modifiedCount: expect.any(Number),
        }),
      );
    });
  });

  describe('DELETE /comments/:id', () => {
    test('returns 401 without Bearer token', async () => {
      const response = await request(app).delete(
        '/comments/507f1f77bcf86cd799439011',
      );

      expect(response.status).toBe(401);
      expect(response.body).toBe('ERROR_EXPECTED_BEARER');
    });

    test('returns 200 delete result when authenticated', async () => {
      const { user, postId } = await createPostForUser();
      await createComment(user, postId, 'to delete');

      const list = await request(app).get('/comments');
      const comment = list.body.find(
        (c: { description?: string }) => c.description === 'to delete',
      );

      const response = await request(app)
        .delete(`/comments/${comment._id}`)
        .set(authHeader(user.token));

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
