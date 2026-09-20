import request from 'supertest';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('GET / (health)', () => {
  test('returns 200 and body { a: 1 }', async () => {
    const response = await request(app).get('/').set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ a: 1 });
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('application/json'),
    );
  });
});

describe('GET /items (existing behavior)', () => {
  test('returns 200 JSON without auth', async () => {
    const response = await request(app)
      .get('/items')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('application/json'),
    );
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /checktoken', () => {
  test('returns 401 without Bearer token', async () => {
    const response = await request(app).get('/checktoken');

    expect(response.status).toBe(401);
    expect(response.body).toBe('ERROR_EXPECTED_BEARER');
  });

  test('returns 200 and "ok" with valid Bearer token', async () => {
    const user = await registerUser();
    const response = await request(app)
      .get('/checktoken')
      .set(authHeader(user.token));

    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});
