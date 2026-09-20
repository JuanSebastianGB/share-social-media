import request from 'supertest';
import { DEFAULT_IMAGE_ID } from '../constants/constants.js';
import { app } from './testApp.js';

describe('GET /defaultstorage (default file bootstrap)', () => {
  test('returns 200 and ensures the DEFAULT_IMAGE_ID row exists (idempotent)', async () => {
    // First call: if the row is missing, the endpoint creates it and returns
    // the file metadata; if the row already exists, it returns null. Either
    // way the response is a JSON 200.
    const first = await request(app)
      .get('/defaultstorage')
      .set('Accept', 'application/json');

    expect(first.status).toBe(200);
    if (first.body !== null) {
      expect(first.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
        }),
      );
      expect(String(first.body._id)).toBe(DEFAULT_IMAGE_ID);
    }

    // Second call: the row must now exist, so the endpoint returns null.
    // Together the two calls characterize the idempotent contract: the
    // DEFAULT_IMAGE_ID row is guaranteed to exist afterwards.
    const second = await request(app)
      .get('/defaultstorage')
      .set('Accept', 'application/json');

    expect(second.status).toBe(200);
    expect(second.body).toBeNull();
  });
});