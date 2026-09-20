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
        userId: user.userId,
      });
    return { user, postId: created.body._id as string };
  }

  describe('GET /comments', () => {
    test('returns 200 array without JWT', async () => {
      const response = await request(app).get('/comments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /comments (no JWT)', () => {
    test('returns 200 updated post when creating a comment', async () => {
      const { user, postId } = await createPostForUser();

      const response = await request(app).post('/comments').send({
        userId: user.userId,
        postId,
        firstName: user.firstName,
        lastName: user.lastName,
        description: 'nice post',
      });

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
      const response = await request(app).post('/comments').send({});

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /comments/:id (no JWT)', () => {
    test('returns 200 comment document', async () => {
      const { user, postId } = await createPostForUser();
      await request(app).post('/comments').send({
        userId: user.userId,
        postId,
        firstName: user.firstName,
        lastName: user.lastName,
        description: 'fetchable',
      });

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

  describe('PUT /comments/:id (no JWT)', () => {
    test('returns 200 update result', async () => {
      const { user, postId } = await createPostForUser();
      await request(app).post('/comments').send({
        userId: user.userId,
        postId,
        firstName: user.firstName,
        lastName: user.lastName,
        description: 'to update',
      });

      const list = await request(app).get('/comments');
      const comment = list.body.find(
        (c: { description?: string }) => c.description === 'to update',
      );

      const response = await request(app)
        .put(`/comments/${comment._id}`)
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

  describe('DELETE /comments/:id (no JWT)', () => {
    test('returns 200 delete result', async () => {
      const { user, postId } = await createPostForUser();
      await request(app).post('/comments').send({
        userId: user.userId,
        postId,
        firstName: user.firstName,
        lastName: user.lastName,
        description: 'to delete',
      });

      const list = await request(app).get('/comments');
      const comment = list.body.find(
        (c: { description?: string }) => c.description === 'to delete',
      );

      const response = await request(app).delete(`/comments/${comment._id}`);

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
