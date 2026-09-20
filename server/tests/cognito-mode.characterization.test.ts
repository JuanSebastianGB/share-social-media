import request from 'supertest';
import { isCognitoAuthEnabled } from '../utilities/cognitoMode.js';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Cognito dual-mode harness (T8 start)', () => {
  test('isCognitoAuthEnabled is false when COGNITO_* are unset (Jest default)', () => {
    expect(process.env.COGNITO_USER_POOL_ID).toBeFalsy();
    expect(process.env.COGNITO_CLIENT_ID).toBeFalsy();
    expect(isCognitoAuthEnabled()).toBe(false);
  });

  test('POST /auth/profile returns 410 ERROR_USE_REGISTER in HS256 mode', async () => {
    const user = await registerUser();
    const response = await request(app)
      .post('/auth/profile')
      .set(authHeader(user.token))
      .field('firstName', 'Alice')
      .field('lastName', 'Smith')
      .field('email', user.email)
      .field('location', 'Buenos Aires')
      .field('occupation', 'Engineer');

    expect(response.status).toBe(410);
    expect(response.body).toBe('ERROR_USE_REGISTER');
  });

  test('POST /auth/profile without Bearer returns 401', async () => {
    const response = await request(app).post('/auth/profile').send({});
    expect(response.status).toBe(401);
    expect(response.body).toBe('ERROR_EXPECTED_BEARER');
  });
});
