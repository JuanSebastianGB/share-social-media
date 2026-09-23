import type { Request, Response } from 'express';
import { defaultErrorFor } from './defaultErrorFor.js';

const makeReq = () => ({}) as Request;

const makeRes = (locals: Record<string, unknown> = {}): Response =>
  ({ locals }) as unknown as Response;

const makeNext = () => {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  return Object.assign(fn, { calls });
};

describe('defaultErrorFor', () => {
  test('stamps the code on res.locals.defaultErrorCode', () => {
    const res = makeRes();
    const middleware = defaultErrorFor('ERROR_CREATE_POST');
    middleware(makeReq(), res, makeNext());

    expect(res.locals.defaultErrorCode).toBe('ERROR_CREATE_POST');
  });

  test('calls next() with no arguments', () => {
    const next = makeNext();
    const middleware = defaultErrorFor('ERROR_GET_POST');
    middleware(makeReq(), makeRes(), next);

    expect(next.calls).toEqual([[]]);
  });

  test('different codes produce different res.locals values', () => {
    const resA = makeRes();
    const resB = makeRes();
    defaultErrorFor('ERROR_A')(makeReq(), resA, makeNext());
    defaultErrorFor('ERROR_B')(makeReq(), resB, makeNext());

    expect(resA.locals.defaultErrorCode).toBe('ERROR_A');
    expect(resB.locals.defaultErrorCode).toBe('ERROR_B');
  });
});