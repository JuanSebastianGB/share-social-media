import type { NextFunction, Request, Response } from 'express';
import { InvalidCatalogItemError } from '../modules/catalog/domain/errors.js';
import { InvalidCommentError } from '../modules/comments/domain/errors.js';
import { InvalidPostError } from '../modules/feed/domain/errors.js';
import { InvalidUserError } from '../modules/identity/domain/errors.js';
import { InvalidMediaFileError } from '../modules/media/domain/errors.js';
import { InvalidFriendListError } from '../modules/social/domain/errors.js';
import { errorMapper, HttpStatusError } from './error-mapper.js';

type Calls = { status: number[]; json: unknown[] };

const makeRes = (
  locals: Record<string, unknown> = {},
): { res: Response; calls: Calls } => {
  const calls: Calls = { status: [], json: [] };
  const res = {
    locals,
    status(code: number) {
      calls.status.push(code);
      return this;
    },
    json(body: unknown) {
      calls.json.push(body);
      return this;
    },
  };
  return { res: res as unknown as Response, calls };
};

const makeReq = () => ({}) as unknown as Request;

const makeNext = () => {
  const fn = (..._args: unknown[]) => {};
  (fn as unknown as { calls: unknown[][] }).calls = [];
  return fn as unknown as NextFunction & { calls: unknown[][] };
};

const captureConsoleError = (): {
  sink: unknown[][];
  restore: () => void;
} => {
  const sink: unknown[][] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    sink.push(args);
  };
  return {
    sink,
    restore: () => {
      console.error = original;
    },
  };
};

const pendingRestores: Array<() => void> = [];
const restoreAll = () => {
  while (pendingRestores.length) pendingRestores.pop()?.();
};

describe('errorMapper', () => {
  afterEach(restoreAll);

  describe('domain errors map to 400 with route defaultErrorCode', () => {
    const cases: Array<[string, () => Error]> = [
      ['InvalidPostError', () => new InvalidPostError('Post body is required')],
      ['InvalidUserError', () => new InvalidUserError('User email is required')],
      ['InvalidMediaFileError', () => new InvalidMediaFileError('Media file id is required')],
      ['InvalidFriendListError', () => new InvalidFriendListError('Cannot friend yourself')],
      ['InvalidCommentError', () => new InvalidCommentError('Comment description is required')],
      ['InvalidCatalogItemError', () => new InvalidCatalogItemError('Catalog item name is required')],
    ];

    for (const [name, make] of cases) {
      test(`${name} → 400 + body === defaultErrorCode`, () => {
        const capture = captureConsoleError();
        pendingRestores.push(capture.restore);

        const { res, calls } = makeRes({ defaultErrorCode: 'ERROR_CREATE_POST' });
        errorMapper(make(), makeReq(), res, makeNext());

        expect(calls.status).toEqual([400]);
        expect(calls.json).toEqual(['ERROR_CREATE_POST']);
        expect(capture.sink).toEqual([]);
      });
    }

    test('domain error without defaultErrorCode → 400 + "Something went wrong"', () => {
      const capture = captureConsoleError();
      pendingRestores.push(capture.restore);

      const { res, calls } = makeRes();
      errorMapper(
        new InvalidPostError('Post body is required'),
        makeReq(),
        res,
        makeNext(),
      );

      expect(calls.status).toEqual([400]);
      expect(calls.json).toEqual(['Something went wrong']);
      expect(capture.sink).toEqual([]);
    });
  });

  describe('unknown errors map to 500 with route defaultErrorCode', () => {
    test('with defaultErrorCode → 500 + body === defaultErrorCode + console.error', () => {
      const capture = captureConsoleError();
      pendingRestores.push(capture.restore);

      const { res, calls } = makeRes({ defaultErrorCode: 'ERROR_GET_POST' });
      const err = new Error('boom');
      errorMapper(err, makeReq(), res, makeNext());

      expect(calls.status).toEqual([500]);
      expect(calls.json).toEqual(['ERROR_GET_POST']);
      expect(capture.sink).toEqual([['[unhandled]', err]]);
    });

    test('without defaultErrorCode → 500 + "Something went wrong"', () => {
      const capture = captureConsoleError();
      pendingRestores.push(capture.restore);

      const { res, calls } = makeRes();
      errorMapper(new Error('boom'), makeReq(), res, makeNext());

      expect(calls.status).toEqual([500]);
      expect(calls.json).toEqual(['Something went wrong']);
      expect(capture.sink).toHaveLength(1);
      expect(capture.sink[0]?.[0]).toBe('[unhandled]');
    });
  });

  describe('HttpStatusError carries its own status + body (highest priority)', () => {
    test('401 → body === code, ignores defaultErrorCode', () => {
      const { res, calls } = makeRes({ defaultErrorCode: 'IGNORED' });
      errorMapper(
        new HttpStatusError(401, 'ERROR_EXPECTED_BEARER'),
        makeReq(),
        res,
        makeNext(),
      );

      expect(calls.status).toEqual([401]);
      expect(calls.json).toEqual(['ERROR_EXPECTED_BEARER']);
    });

    test('410 → body === code', () => {
      const { res, calls } = makeRes({ defaultErrorCode: 'IGNORED' });
      errorMapper(
        new HttpStatusError(410, 'ERROR_USE_COGNITO_AUTH'),
        makeReq(),
        res,
        makeNext(),
      );

      expect(calls.status).toEqual([410]);
      expect(calls.json).toEqual(['ERROR_USE_COGNITO_AUTH']);
    });

    test('does NOT call console.error (it is an explicit, intentional error)', () => {
      const capture = captureConsoleError();
      pendingRestores.push(capture.restore);

      const { res } = makeRes();
      errorMapper(
        new HttpStatusError(404, 'ERROR_TOGGLE_FRIEND'),
        makeReq(),
        res,
        makeNext(),
      );

      expect(capture.sink).toEqual([]);
    });
  });

  describe('response is always sent (next() never called)', () => {
    test('for domain error', () => {
      const capture = captureConsoleError();
      pendingRestores.push(capture.restore);

      const next = makeNext();
      errorMapper(new InvalidPostError('x'), makeReq(), makeRes().res, next);
      expect(next.calls).toEqual([]);
    });
    test('for unknown error', () => {
      const capture = captureConsoleError();
      pendingRestores.push(capture.restore);

      const next = makeNext();
      errorMapper(new Error('x'), makeReq(), makeRes().res, next);
      expect(next.calls).toEqual([]);
    });
  });
});