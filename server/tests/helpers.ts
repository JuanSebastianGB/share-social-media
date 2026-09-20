import request from 'supertest';
import { app } from './testApp.js';

export type RegisteredUser = {
  email: string;
  password: string;
  token: string;
  userId: string;
  firstName: string;
  lastName: string;
};

let userCounter = 0;

/** Emails must be ≤30 chars (validator max). */
const uniqueEmail = () => {
  userCounter += 1;
  return `u${userCounter}${Date.now().toString(36)}@ex.co`;
};

/** Minimal PNG (1x1) for multipart register. */
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

export async function registerUser(
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    location: string;
    occupation: string;
  }> = {},
): Promise<RegisteredUser> {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? 'pass12';
  const firstName = overrides.firstName ?? 'Alice';
  const lastName = overrides.lastName ?? 'Smith';

  const response = await request(app)
    .post('/auth/register')
    .field('firstName', firstName)
    .field('lastName', lastName)
    .field('email', email)
    .field('password', password)
    .field('location', overrides.location ?? 'Buenos Aires')
    .field('occupation', overrides.occupation ?? 'Engineer')
    .attach('myFile', TINY_PNG, 'avatar.png');

  if (response.status !== 200) {
    throw new Error(
      `registerUser failed: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  return {
    email,
    password,
    token: response.body.token as string,
    userId: String(response.body.response._id),
    firstName,
    lastName,
  };
}

export async function loginUser(email: string, password: string) {
  return request(app).post('/auth/login').send({ email, password });
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
