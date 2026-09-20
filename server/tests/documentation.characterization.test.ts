import request from 'supertest';
import { app } from './testApp.js';

describe('GET /documentation.json (contract of record)', () => {
  test('serves docs/api-spec.yml with the full path catalog', async () => {
    const response = await request(app)
      .get('/documentation.json')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('application/json'),
    );
    expect(response.body.openapi).toBe('3.0.3');

    const paths = Object.keys(response.body.paths ?? {});
    expect(paths.length).toBeGreaterThanOrEqual(22);
    expect(paths).toEqual(expect.arrayContaining(['/auth/register', '/items/{id}']));
  });
});
