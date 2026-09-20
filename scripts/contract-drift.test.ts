import express from 'express';
import {
  drift,
  extractAppPaths,
  extractSpecPaths,
  normalizeOpenApiPath,
} from './contract-drift.js';

describe('normalizeOpenApiPath', () => {
  test('replaces {param} with :param', () => {
    expect(normalizeOpenApiPath('/users/{id}/friends')).toBe('/users/:id/friends');
  });
  test('keeps root as /', () => {
    expect(normalizeOpenApiPath('/')).toBe('/');
  });
});

describe('extractSpecPaths', () => {
  test('returns normalized paths from spec.paths', () => {
    const paths = extractSpecPaths({
      paths: { '/users/{id}': {}, '/items': {}, '/': {} },
    });
    expect(paths).toEqual(expect.arrayContaining(['/users/:id', '/items', '/']));
  });
  test('handles missing paths', () => {
    expect(extractSpecPaths({})).toEqual([]);
  });
});

describe('drift', () => {
  test('empty spec + empty app -> no drift', () => {
    expect(drift([], [])).toEqual({ missingInApp: [], missingInSpec: [] });
  });
  test('spec path not in app -> missingInApp', () => {
    expect(drift(['/foo'], [])).toEqual({
      missingInApp: ['GET /foo'],
      missingInSpec: [],
    });
  });
  test('app method+path not in spec -> missingInSpec', () => {
    expect(drift([], ['GET /bar'])).toEqual({
      missingInApp: [],
      missingInSpec: ['GET /bar'],
    });
  });
  test('Swagger UI paths excluded from missingInSpec', () => {
    expect(drift([], ['GET /documentation', 'GET /documentation.json'])).toEqual({
      missingInApp: [],
      missingInSpec: [],
    });
  });
});

describe('extractAppPaths (smoke)', () => {
  test('extracts a top-level route', () => {
    const app = express();
    app.get('/foo', (_req, res) => res.send('ok'));
    expect(extractAppPaths(app)).toEqual(expect.arrayContaining(['GET /foo']));
  });
  test('extracts routes nested under a mounted router', () => {
    const app = express();
    const router = express.Router();
    router.get('/inner', (_req, res) => res.send('ok'));
    app.use('/api', router);
    expect(extractAppPaths(app)).toEqual(expect.arrayContaining(['GET /api/inner']));
  });
});
