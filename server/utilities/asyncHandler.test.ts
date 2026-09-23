import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from './asyncHandler.js';

const makeReq = () => ({}) as Request;
const makeRes = (): Response => ({} as Response);

const makeNext = () => {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  return Object.assign(fn, { calls });
};

describe('asyncHandler', () => {
  test('forwards (req, res, next) to the wrapped handler', async () => {
    const received: { req: Request | null; res: Response | null; next: NextFunction | null } = {
      req: null,
      res: null,
      next: null,
    };
    const wrapped = asyncHandler(async (req, res, next) => {
      received.req = req;
      received.res = res;
      received.next = next;
    });
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await wrapped(req, res, next);

    expect(received.req).toBe(req);
    expect(received.res).toBe(res);
    expect(received.next).toBe(next);
    expect(next.calls).toEqual([]);
  });

  test('catches rejections and forwards them to next(err)', async () => {
    const wrapped = asyncHandler(async () => {
      throw new Error('boom');
    });
    const next = makeNext();

    await wrapped(makeReq(), makeRes(), next);

    expect(next.calls).toHaveLength(1);
    const arg = next.calls[0]?.[0] as Error;
    expect(arg).toBeInstanceOf(Error);
    expect(arg.message).toBe('boom');
  });

  test('handles synchronous throws', async () => {
    const wrapped = asyncHandler(() => {
      throw new Error('sync boom');
    });
    const next = makeNext();

    await wrapped(makeReq(), makeRes(), next);

    expect(next.calls).toHaveLength(1);
    expect(next.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  test('does not call next() when handler resolves', async () => {
    const wrapped = asyncHandler(async () => undefined);
    const next = makeNext();

    await wrapped(makeReq(), makeRes(), next);

    expect(next.calls).toEqual([]);
  });
});