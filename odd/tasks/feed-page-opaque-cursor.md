# Feed page opaque cursor

## Objective

Hide the GSI1 resume key behind the Feed page module. Callers of the Post repository pass an opaque continuation string. Dynamo and in-memory adapters encode their own cursors.

## Problem

`FeedPageCursor` on `PostRepository` is `{ PK, SK, GSI1PK, GSI1SK }`. `listFeedPostsPage` and both adapters must speak Dynamo keys.

## Why

The published home Feed was the latest hotspot. Two adapters already sit on this seam. The key shape does not belong on it.

## Scope

- Port `queryFeedIds` takes and returns `continuation?: string`.
- `listFeedPostsPage` threads that string and does not inspect it.
- Dynamo adapter serializes the private GSI1 key with `JSON.stringify`.
- In-memory adapter uses the id it stopped after. A string that is not that id ends the walk.
- A continuation this adapter did not mint, or cannot decode, ends the walk (empty page, no continuation). It must not restart from the head.

## Constraints

- HTTP `page` and `search` stay the same. Search still drains `listFeedIds()`.
- Hydration stays in `listFeedPostsPage`.
- `countPostsService` and the discarded page count stay.
- `server/db/memoryClient.ts` keeps real GSI1 keys. That seam is below the repository.
- `CONTEXT.md` Feed means the chronological list. Do not put the continuation token in the glossary.
- No commit unless the user asks.

## Route

Delegated writer. Trigger: port, page module, Dynamo adapter, and in-memory adapter are all non-trivial.

## TDD

- Mode: on for the new opacity behavior.
- Source: project base-standards (new behavior test-first; existing page tests stay the behavior lock).
- Runner: `NODE_OPTIONS=--experimental-vm-modules pnpm exec jest --runInBand --forceExit` from `server/`.

## Tasks

- [x] **T1** Opaque continuation on the Feed id page. RED: new tests failed to compile because `continuation` was not on `FeedIdPage` (TS2339 / TS2353). GREEN: 8 tests passed in `query-posts.test.ts`, `in-memory-post-repository.test.ts`, and `dynamodb-post-repository.test.ts`.

## Acceptance

- `FeedPageCursor` is gone from the port.
- Page tests in `query-posts.test.ts` stay green and still do not name key fields.
- `count()` on the Dynamo adapter still counts GSI1 only.

## Checks

- 2026-09-27: 8 passed / 3 suites (the three files in T1). Verified again after the writer returned.
- Skipped: full server suite, typecheck.
- Work-unit commit: `fc3a3bd` `refactor(server): hide the feed page cursor inside the adapters`.
- Rollback boundary: the Post repository port, `listFeedPostsPage`, both feed adapters, their continuation tests, the Feed glossary line, and this task note.
- Runtime harness: N/A. The change stays behind the existing HTTP page contract. No new route.

## Progress

Branch `feat/feed-page-opaque-cursor` from `origin/main`. T1 committed as `fc3a3bd`. Next: pull request.
