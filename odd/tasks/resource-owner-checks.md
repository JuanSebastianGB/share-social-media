# Resource owner checks

## Objective

A signed-in user who is not the author can no longer update or delete that comment, delete that post, or soft-delete that file. Public reads stay public. Any authenticated user can still like a post.

Issue: https://github.com/JuanSebastianGB/share-social-media/issues/96

## Problem

JWT is already required on comment PUT/DELETE, post DELETE, and the `/storage` mount. Those handlers never compare `req.userData._id` to the resource author, so any signed-in user can mutate someone else's comment, post, or file.

## Why

The open backlog item is an authorization hole, not a missing login check. Comments and posts already store the author. FILE rows do not.

## Scope

### In

- Reject a non-author on comment update, comment delete, and post delete.
- Record the caller as owner when a file is created with a known user id (`POST /storage`, `POST /posts/file`).
- Reject soft-delete when the caller is not that owner, including FILE rows that have no owner (fail closed, no backfill).
- Characterization tests for the cross-user rejection, plus the existing owner success cases.
- Docs that still describe the old JWT gap or omit the FILE owner.

### Out

- Changing `checkValidJwt`, like toggles (`PUT /posts/:id`), or public reads.
- Hard-delete behavior when the post author deletes their own post (still hard-deletes `fileId`, including shared `DEFAULT_IMAGE_ID`).
- Backfilling owners onto existing FILE rows.
- Stamping an owner on register/profile uploads, which run before a user id exists.

## Constraints

- HTTP rejection: **403** with JSON string body `ERROR_NOT_RESOURCE_OWNER`. Matches this API's business-failure status. **401** stays session-only. A missing resource stays **200** with `matchedCount`/`deletedCount` 0.
- Throw `NotResourceOwnerError` from the application use case (mapped in `error-mapper`) before any mutation. Post delete must reject **before** `deleteHardFileService`.
- Domain field `ownerId` on `MediaFile`, persisted as Dynamo `userId` (same attribute name as post and comment authors). Optional on read so legacy rows reconstitute.
- TDD: **on**. Source: `AGENTS.md` / `CLAUDE.md` (new behavior). Runner: Jest via `pnpm --filter server test` (focused path first).
- Do not commit unless the user asks. Branch: `feat/resource-owner-checks`.

## Decisions

- Status 403 `ERROR_NOT_RESOURCE_OWNER` is the local business-failure convention (`docs/backend-standards.md`, OpenAPI 403 string bodies). Resources are publicly readable, so a 403 does not leak existence beyond public GETs.
- Ownerless FILE rows cannot be soft-deleted. `DEFAULT_IMAGE_ID` has no owner. No migration.
- Post-author delete still hard-deletes the attached file. Issue risk says that path stays.

## Authorized scope

User: implement https://github.com/JuanSebastianGB/share-social-media/issues/96

## Acceptance criteria

1. Another user's comment update or delete returns 403 `ERROR_NOT_RESOURCE_OWNER` and leaves the comment unchanged. The author still gets 200.
2. Another user's post delete returns 403 and leaves the post and its file in place. The author still gets 200 and the existing hard-delete of `fileId`.
3. Soft-delete of a file succeeds only for the stored owner. A different caller, or a file with no owner, gets 403 and the file stays.
4. New storage and post-file uploads persist `userId`. Register and default-image creates do not.
5. Likes, public reads, and the JWT middleware contract stay as they are.
6. `pnpm --filter server test` passes.

## Applicable checks

- `pnpm --filter server test` (focused Jest file during the slice, full suite at the end)
- `pnpm --filter server typecheck`
- Docs listed below are updated with the owner rule
- RDD: run `gentle-ai review mode status` before any review; do not commit (user did not ask)

## Delivery

- Strategy: one pull request to `main` (user, 2026-09-24). The diff is over the 400-line review budget; the user kept one pull request because the owner check is one behavior.
- The pull request description contains `Closes #96`.

## Checklist

- [x] **T1** — Comment update and delete reject a non-author (route: delegated)
- [x] **T2** — Post delete rejects a non-author before hard-deleting the file (route: delegated)
- [x] **T3** — FILE owner on create; soft-delete rejects a non-owner and an ownerless row (route: delegated)
- [x] **T4** — Docs: data model, API spec, backend-standards, development.md, README backlog, CONTEXT.md MediaFile row (route: delegated)

## Progress

- Branch: `feat/resource-owner-checks`
- Owner-check commit: `e3836a5`
- Next: open the pull request to `main` with `Closes #96`

## Verification evidence

- T1: focused comment + error-mapper Jest, 3 suites, 39 tests passed. `tsc --noEmit` passed.
- T2: `pnpm --filter server test -- tests/posts.characterization.test.ts` → 11 tests passed. RED was `Expected 403, Received 200` on non-author delete.
- T3: media use-case, domain, and `tests/storage.characterization.test.ts` → 3 suites, 28 tests passed. RED was soft-delete resolving with `deletedCount: 1` for a non-owner.
- Close: `pnpm --filter server test` → 37 suites, 248 tests passed. `pnpm --filter server exec tsc --noEmit` passed.
- `pnpm --filter server test:integration` (DynamoDB Local): first run failed before HTTP specs loaded (`OPENAPI_SPEC_PATH` missing in `server/tests/integration/setup-env.cjs`, so `app.ts` looked for `docs/api-spec.yml` above the repo). After setting that path: 6 suites, 14 tests passed. These specs cover the owner success path (author delete returns 200). The non-owner 403 stays in the characterization suite.
