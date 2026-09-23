# feat-error-mapper: centralized HTTP error middleware

## Goal

Delete all 53 `try/catch` blocks and 35+ `handleHttpErrors(res, 'ERROR_X')` calls in controllers + middlewares. Replace with one Express error middleware that maps domain errors to HTTP responses via a registry. Preserve the **current HTTP response shape** (body is a STRING, not an object) so characterization tests pass unchanged.

Behavior MUST stay byte-for-byte identical for the success path AND for the error path. This is a pure refactor: same status codes, same body strings, same defaults (403). New behavior is logging (centralized) and per-route default codes (more flexible, but defaults preserve current behavior).

## Constraints

- **Body is a STRING** (not `{ code, message }`). Characterization tests assert `expect(response.body).toBe('ERROR_CREATE_POST')`.
- **Default status is 403** for legacy error codes that didn't pass an explicit code. Preserve this.
- **Domain errors** (`InvalidPostError`, etc.) → 400, body = route's `defaultErrorCode` (preserves legacy code per route).
- **Plain `Error('USER_OR_FRIEND_NOT_FOUND')`** in `toggle-friendship.ts` → 404, body = `ERROR_TOGGLE_FRIEND`.
- **Unknown errors** → 500, body = route's `defaultErrorCode` (or `Something went wrong` if no route default).
- **Logging**: centralize `console.error('[unhandled]', err)` in the error middleware; delete all `console.log(error)` in catch blocks.
- **No new dependencies**. Pure stdlib + Express.
- **One file for the middleware, one file for asyncHandler, one file for defaultErrorFor**. No sprawling abstractions.

## File map (final state)

```
NEW: server/middlewares/error-mapper.ts        (~50 LOC, registry + middleware)
NEW: server/middlewares/error-mapper.test.ts   (~80 LOC, jest tests)
NEW: server/utilities/asyncHandler.ts          (~10 LOC)
NEW: server/utilities/defaultErrorFor.ts       (~15 LOC, includes Request augmentation)
DELETE: server/utilities/handleHttpErrors.ts   (no more callers)
MODIFY: server/app.ts                          (register error-mapper LAST, after routes)
MODIFY: server/routes/posts.ts                 (add defaultErrorFor + asyncHandler)
MODIFY: server/routes/comments.ts              (same)
MODIFY: server/routes/users.ts                 (same)
MODIFY: server/routes/items.ts                 (same)
MODIFY: server/routes/storage.ts               (same)
MODIFY: server/routes/auth.ts                  (same)
MODIFY: server/routes/index.ts                 (no change unless route files moved)
MODIFY: server/controllers/posts.ts            (remove try/catch, body becomes async return)
MODIFY: server/controllers/comments.ts         (same)
MODIFY: server/controllers/users.ts            (same)
MODIFY: server/controllers/items.ts            (same)
MODIFY: server/controllers/storage.ts          (same)
MODIFY: server/controllers/auth.ts             (same)
MODIFY: server/middlewares/session.ts          (remove inline handleHttpErrors; call next(err))
MODIFY: server/middlewares/role.ts             (same)
MODIFY: server/modules/social/application/use-cases/toggle-friendship.ts (throw UserOrFriendNotFoundError)
NEW:    server/modules/social/domain/errors.ts (add UserOrFriendNotFoundError class)
```

## Tasks

### T1 — RED: characterization test for error-mapper middleware

File: `server/middlewares/error-mapper.test.ts`

Test the middleware directly (no supertest needed). The middleware receives `(err, req, res, next)`.

Test cases:
- `err = new InvalidPostError('Post body is required')`, `req.defaultErrorCode = 'ERROR_CREATE_POST'` → `res.status(400)`, `res.body === 'ERROR_CREATE_POST'`
- `err = new InvalidUserError(...)`, `req.defaultErrorCode = 'ERROR_REGISTER'` → `res.status(400)`, `res.body === 'ERROR_REGISTER'`
- Same for `InvalidMediaFileError`, `InvalidFriendListError`, `InvalidCommentError`, `InvalidCatalogItemError`
- `err = new UserOrFriendNotFoundError()`, no `defaultErrorCode` → `res.status(404)`, `res.body === 'ERROR_TOGGLE_FRIEND'`
- `err = new Error('random')`, `req.defaultErrorCode = 'ERROR_GET_POST'` → `res.status(500)`, `res.body === 'ERROR_GET_POST'`
- `err = new Error('random')`, no `defaultErrorCode` → `res.status(500)`, `res.body === 'Something went wrong'`
- Verify `console.error` is called once for the unknown-error case

Use a fake `res` object with `status` and `json` jest mocks. Run tests via `pnpm --filter server test`. They MUST fail initially because the middleware doesn't exist yet.

### T2 — GREEN: implement error-mapper middleware

File: `server/middlewares/error-mapper.ts`

```ts
import type { ErrorRequestHandler } from 'express';
import { InvalidCommentError } from '../modules/comments/domain/errors.js';
import { InvalidCatalogItemError } from '../modules/catalog/domain/errors.js';
import { InvalidMediaFileError } from '../modules/media/domain/errors.js';
import { InvalidFriendListError, UserOrFriendNotFoundError } from '../modules/social/domain/errors.js';
import { InvalidPostError } from '../modules/feed/domain/errors.js';
import { InvalidUserError } from '../modules/identity/domain/errors.js';
import type { DomainError } from '../modules/<bc>/domain/errors.js'; // whichever BC owns the base class
```

(All 6 BCs re-export `DomainError`. The mapper only needs `instanceof` checks per subclass.)

The registry shape:
```ts
const DOMAIN_TO_400: Array<[Function]> = [
  [InvalidPostError], [InvalidUserError], [InvalidMediaFileError],
  [InvalidFriendListError], [InvalidCommentError], [InvalidCatalogItemError],
];
```

Middleware logic:
1. If `err instanceof UserOrFriendNotFoundError` → 404 + `'ERROR_TOGGLE_FRIEND'`.
2. If any of the 6 `Invalid*Error` classes → 400 + `req.defaultErrorCode ?? 'Something went wrong'`.
3. Else → 500 + `req.defaultErrorCode ?? 'Something went wrong'` AND `console.error('[unhandled]', err)`.

Tests from T1 must pass.

### T3 — Register middleware in app.ts

File: `server/app.ts`

Add `app.use(errorMapper)` AFTER all routes but BEFORE the error middleware ordering matters (Express recognizes error middleware by 4 args).

Verify `pnpm typecheck` still passes (no unused imports).

### T4 — Create asyncHandler utility

File: `server/utilities/asyncHandler.ts`

```ts
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

Used as the controller export: `export const createUserPost = asyncHandler(async (req, res) => { ... })`.

### T5 — Create defaultErrorFor utility

File: `server/utilities/defaultErrorFor.ts`

```ts
import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    defaultErrorCode?: string;
  }
}

export const defaultErrorFor = (code: string) =>
  (_req: Request, _res: Response, next: NextFunction): void => {
    _req.defaultErrorCode = code;
    next();
  };
```

This is a stamp middleware used in routes between `checkValidJwt` and the handler.

### T6 — Migrate posts route + controller (first batch, validates pattern)

Files: `server/routes/posts.ts`, `server/controllers/posts.ts`

For each route, insert `defaultErrorFor('ERROR_X')` between auth/validator and the handler, and wrap the handler with `asyncHandler`. Controllers lose their `try/catch` blocks — they return `res.json(...)` directly. The handler signature stays `async (req, res)` but is wrapped via `asyncHandler(async (req, res) => { ... })`.

Map of route → default code (extracted from current `handleHttpErrors` calls):
- `GET /` → `ERROR_GET_POSTS` (currently 500-default; keep `ERROR_GET_POSTS`)
- `GET /:id` → `ERROR_GET_POST`
- `POST /file` → `ERROR_CREATE_POST`
- `POST /` → `ERROR_CREATE_POST`
- `PUT /:id` → `ERROR_TOGGLE_LIKE_POST`
- `DELETE /:id` → `ERROR_DELETE_POST`
- `GET /:id/comments` → `ERROR_GET_POST_COMMENTS`

Verify the 7 posts characterization tests in `server/tests/posts.characterization.test.ts` still pass byte-for-byte. If ANY test fails, fix the migration before moving to T7. Do NOT change test assertions.

### T7 — Migrate remaining routes + controllers

Files:
- `routes/comments.ts` + `controllers/comments.ts`
- `routes/users.ts` + `controllers/users.ts`
- `routes/items.ts` + `controllers/items.ts`
- `routes/storage.ts` + `controllers/storage.ts`
- `routes/auth.ts` + `controllers/auth.ts`

Same pattern as T6. For each route, map to the existing `handleHttpErrors(res, 'ERROR_X')` code (preserve the code).

For `controllers/auth.ts`: 13 `handleHttpErrors` calls. Map them all.

### T9 — Migrate session + role middlewares

Files: `server/middlewares/session.ts`, `server/middlewares/role.ts`

These call `handleHttpErrors(res, 'ERROR_X')` inline (no try/catch). Convert them to call `next(err)` after attaching a default code.

Pattern:
```ts
// before:
return handleHttpErrors(res, 'ERROR_EXPECTED_BEARER', 401);

// after:
req.defaultErrorCode = 'ERROR_EXPECTED_BEARER';
return next(new Error('Expected Bearer token'));
```

Or even cleaner: throw an inline error with the right code via a tiny helper. (The error mapper handles status from the error class; for these specific 401/410 cases, we want the right status. For now, use the inline-error + defaultCode approach; a follow-up can introduce `UnauthorizedError(401)` etc. — but that's out of scope here.)

Actually simpler: keep these specific status codes by adding `HttpStatusError` (a small class that carries `{status, code}`), and let the error mapper check it FIRST. See T10.

### T10 — Introduce `HttpStatusError` for non-domain status codes

File: `server/middlewares/error-mapper.ts` (extend)

Add:
```ts
export class HttpStatusError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
    this.name = 'HttpStatusError';
  }
}
```

Extend the middleware to check `HttpStatusError` FIRST → return `res.status(err.status).json(err.code)`. Use this for the 401/410 cases in session.ts and auth.ts.

For the auth controller's `410 ERROR_USE_COGNITO_AUTH` and `410 ERROR_USE_REGISTER`, use `new HttpStatusError(410, 'ERROR_USE_COGNITO_AUTH')`.

For session middleware's 401s, use `new HttpStatusError(401, 'ERROR_EXPECTED_BEARER')` etc.

This replaces the legacy `handleHttpErrors(res, code, status)` pattern.

### T11 — Replace plain `Error` in toggle-friendship with `UserOrFriendNotFoundError`

Files:
- `server/modules/social/domain/errors.ts` — add the class
- `server/modules/social/application/use-cases/toggle-friendship.ts` — throw it instead of plain Error
- `server/middlewares/error-mapper.ts` — already mapped in T2

```ts
// in social/domain/errors.ts:
export class UserOrFriendNotFoundError extends DomainError {
  constructor() {
    super('USER_OR_FRIEND_NOT_FOUND');
    this.name = 'UserOrFriendNotFoundError';
  }
}
```

```ts
// in toggle-friendship.ts:
if (!actor || !friend) throw new UserOrFriendNotFoundError();
```

Verify `server/tests/social.integration.spec.ts` still passes (it might assert on the legacy error message — check, and update the assertion to match the new error class name).

### T12 — Delete handleHttpErrors utility

File: `server/utilities/handleHttpErrors.ts` — DELETE.

Verify no remaining references via grep.

### T13 — Final verification

Run in order:
1. `pnpm typecheck` — no type errors
2. `pnpm lint` — no lint errors
3. `pnpm --filter server test` — all characterization tests pass (including error cases)
4. `pnpm --filter server test:integration` — if applicable
5. Manual: count `handleHttpErrors` references (should be 0) and `try {` in controllers (should be 0 outside of utility files)

## Commit plan

One work-unit commit per task where it makes sense (T1 alone is its own RED commit; T2+T3 can be one GREEN+wire commit; T4+T5 utilities can be one commit; T6 alone to validate pattern; T7 one commit covering 5 route/controller pairs; T9+T10 one commit for middlewares; T11 one commit; T12+T13 final cleanup).

If the diff exceeds 400 lines or 10 files in any single commit, split. Otherwise, batch by logical unit.