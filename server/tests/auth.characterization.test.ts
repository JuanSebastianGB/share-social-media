import request from 'supertest';
import { app } from './testApp.js';
import { loginUser, registerUser } from './helpers.js';

describe('Auth characterization', () => {
  describe('POST /auth/register', () => {
    test('returns ERROR_UPLOAD_FILE (403) when myFile is missing', async () => {
      const response = await request(app).post('/auth/register').send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: `nf${Date.now().toString(36)}@ex.co`,
        password: 'pass12',
        location: 'Buenos Aires',
        occupation: 'Engineer',
      });

      expect(response.status).toBe(403);
      expect(response.body).toBe('ERROR_UPLOAD_FILE');
    });

    test('returns 200 with { response, token } when multipart succeeds', async () => {
      const user = await registerUser();

      expect(user.token).toEqual(expect.any(String));
      expect(user.userId).toEqual(expect.any(String));
    });

    test('returns 403 validation errors for invalid email', async () => {
      const tinyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      );

      const response = await request(app)
        .post('/auth/register')
        .field('firstName', 'Alice')
        .field('lastName', 'Smith')
        .field('email', 'not-an-email')
        .field('password', 'pass12')
        .field('location', 'Buenos Aires')
        .field('occupation', 'Engineer')
        .attach('myFile', tinyPng, 'avatar.png');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    test('returns 200 with { userFound, token } for valid credentials', async () => {
      const user = await registerUser();
      const response = await loginUser(user.email, user.password);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          userFound: expect.objectContaining({
            email: user.email,
            _id: user.userId,
          }),
        }),
      );
      expect(response.body.userFound.password).toBeUndefined();
    });

    test('returns ERROR_USER_NOT_FOUND (403) for unknown email', async () => {
      const response = await loginUser(
        `missing-${Date.now()}@example.com`,
        'pass12',
      );

      expect(response.status).toBe(403);
      expect(response.body).toBe('ERROR_USER_NOT_FOUND');
    });

    test('returns ERROR_PASSWORD (403) for wrong password', async () => {
      const user = await registerUser();
      const response = await loginUser(user.email, 'wrong1');

      expect(response.status).toBe(403);
      expect(response.body).toBe('ERROR_PASSWORD');
    });

    test('returns 403 validation errors when body is empty', async () => {
      const response = await request(app).post('/auth/login').send({});

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
