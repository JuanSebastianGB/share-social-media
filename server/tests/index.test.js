import request from 'supertest';
import { app } from '../app.js';

describe('GET /', () => {
  test('should return status code 200', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .send();
    expect(response.status).toBe(200);
  });
  test('should return { a: 1 }', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .send();
    expect(response.body).toEqual({ a: 1 });
  });
  test('should return Content-Type application/json', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .send();
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('application/json')
    );
  });
  test('should return Content-Length greater than 0', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .send();
    const contentLength = Number(response.headers['content-length']);
    expect(contentLength).toBeGreaterThan(0);
  });
});

describe('GET /items', () => {
  test('should return status code 200', (done) => {
    request(app)
      .get('/items')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
