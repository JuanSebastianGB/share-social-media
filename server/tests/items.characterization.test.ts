import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import request from 'supertest';
import { getDocClient } from '../db/client.js';
import { SK, TABLE_NAME, userPk } from '../db/keys.js';
import { authHeader, loginUser, registerUser } from './helpers.js';
import { app } from './testApp.js';

/**
 * Local-auth admin elevation for Items characterization.
 *
 * `registerUser` creates role `'user'` and bakes it into the HS256 JWT.
 * Role middleware reads `req.userData.role` from that JWT (local mode), so
 * elevating Dynamo alone is not enough — we must:
 * 1. Update USER#… PROFILE `role` to `['admin']` via DocumentClient
 * 2. Re-login so the new token carries `admin`
 */
async function elevateToAdmin(user: {
  userId: string;
  email: string;
  password: string;
}): Promise<string> {
  await getDocClient().send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(user.userId), SK: SK.PROFILE },
      UpdateExpression: 'SET #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':role': ['admin'] },
    }),
  );
  const login = await loginUser(user.email, user.password);
  if (login.status !== 200 || !login.body.token) {
    throw new Error(
      `elevateToAdmin login failed: ${login.status} ${JSON.stringify(login.body)}`,
    );
  }
  return String(login.body.token);
}

const VALID_MISSING_ID = '507f1f77bcf86cd799439099';

describe('Items HTTP characterization (Catalog facade)', () => {
  test('GET /items → 200 array without auth', async () => {
    const response = await request(app)
      .get('/items')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /items/:id missing → 200 null (valid mongo id)', async () => {
    const user = await registerUser();
    const response = await request(app)
      .get(`/items/${VALID_MISSING_ID}`)
      .set(authHeader(user.token));

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  test('GET /items/:id without auth → 401', async () => {
    const response = await request(app).get(`/items/${VALID_MISSING_ID}`);

    expect(response.status).toBe(401);
  });

  test('POST /items without auth → 401', async () => {
    const response = await request(app)
      .post('/items')
      .send({ name: 'ValidName', active: true });

    expect(response.status).toBe(401);
  });

  test('POST /items as non-admin → 403 ERROR_NOT_AUTHORIZED', async () => {
    const user = await registerUser();
    const response = await request(app)
      .post('/items')
      .set(authHeader(user.token))
      .send({ name: 'ValidName', active: true });

    expect(response.status).toBe(403);
    expect(response.body).toBe('ERROR_NOT_AUTHORIZED');
  });

  test('POST /items as admin with valid body → 200 { newItem }', async () => {
    const user = await registerUser();
    const adminToken = await elevateToAdmin(user);

    const response = await request(app)
      .post('/items')
      .set(authHeader(adminToken))
      .send({ name: 'CatalogThing', active: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      newItem: expect.objectContaining({
        _id: expect.any(String),
        name: 'CatalogThing',
        active: true,
      }),
    });
  });

  test('PUT /items/:id update name/active → UpdateResult shape', async () => {
    const user = await registerUser();
    const adminToken = await elevateToAdmin(user);

    const created = await request(app)
      .post('/items')
      .set(authHeader(adminToken))
      .send({ name: 'BeforeName', active: true });
    const id = created.body.newItem._id as string;

    const response = await request(app)
      .put(`/items/${id}`)
      .set(authHeader(user.token))
      .send({ name: 'AfterName', active: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });
  });

  test('DELETE /items/:id → DeleteResult shape', async () => {
    const user = await registerUser();
    const adminToken = await elevateToAdmin(user);

    const created = await request(app)
      .post('/items')
      .set(authHeader(adminToken))
      .send({ name: 'ToDelete', active: true });
    const id = created.body.newItem._id as string;

    const response = await request(app)
      .delete(`/items/${id}`)
      .set(authHeader(user.token));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
  });

  test('POST /items validation fail (short name) → 403 with errors', async () => {
    const user = await registerUser();
    const adminToken = await elevateToAdmin(user);

    const response = await request(app)
      .post('/items')
      .set(authHeader(adminToken))
      .send({ name: 'ab', active: true });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        errors: expect.any(Array),
      }),
    );
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
