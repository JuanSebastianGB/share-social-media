# Feature: Page the home feed from GSI1

## Objective

`GET /posts` pages the global feed with a limited GSI1 query and counts posts with a GSI1 `COUNT` query. The JSON body stays an array of at most 2 hydrated posts.

## Problem

`listFeedPostsPage` loads every feed id, hydrates each post, filters with `matchesSearch`, then slices. `count()` scans the table for `POST#` / `META`. The handler throws that total away.

## Why

Issue 98. Home-feed reads grow with the whole post set.

## Scope

- In: feed page query, feed count, in-process memory query paging so tests see the same cursor behavior, docs for the feed count access pattern
- Out: user, comment, item, and file scans; post write shape; GSI key layout; response shape; client page size

## Constraints

- Empty `search`: walk GSI1 newest-first, skip posts that fail hydration, stop once `start + limit` survivors exist, then slice. Page membership stays the filtered list.
- Non-empty `search`: still walk the whole feed, because `matchesSearch` uses hydrated `body`, `firstName`, `lastName`, and `location`. Search paging is a follow-up. This ticket keeps today's matches.
- `count()` is the number of items on GSI1 `FEED`, not a table scan. The handler still discards the total.
- Do not change `GET /posts` status or body shape.

## TDD

- Mode: on for new query behavior; characterization first for legacy HTTP
- Source: `docs/base-standards.md` plus issue 98
- Runner: `pnpm --filter server test`

## Seams

- HTTP `GET /posts` page and search (issue 98)
- `PostRepository.queryFeedIds` / `count` for the limited query and the index count

## Route

- T1 inline (one characterization file)
- T2–T5 inline after the feed map was already in context (memory client, repository, use case, docs)

## Checklist

- [x] T1 characterize-http — lock page windows and search membership on `GET /posts` — `pnpm --filter server test -- tests/posts.characterization.test.ts` green before the query change
- [x] T2 memory-query — GSI sort, `ExclusiveStartKey`, `LastEvaluatedKey`, `Select: COUNT` — `tests/memory-query.test.ts` red then green
- [x] T3 gsi-count — `DynamoPostRepository.count` queries GSI1 `COUNT` and ignores a `POST#` row that is not on the feed index — count test red (`Received: 2`) then green
- [x] T4 page-query — `listFeedPostsPage` stops after the page when search is empty and still returns a later search match — `query-posts.test.ts` red (5 reads / 4 reads) then green
- [x] T5 docs — `docs/data-model.md`, `docs/backend-standards.md`
- [x] T6 review-restructure — drop the infinity search mode, one GSI1 query helper, one cursor shape, missing resume key returns no items — feed tests 23 passed, server typecheck and lint passed

## Acceptance

- `GET /posts` still returns a JSON array, hard-coded limit 2
- Five hydrated posts partition into pages of 2, 2, and 1 with no duplicates
- Search still returns the same matches, including a match that is not in the first raw page
- Empty search does not hydrate the tail past `start + limit` survivors
- `count()` does not count a post meta row missing `GSI1PK = FEED`
- Characterization and unit tests green

## Progress

- Branch `feat/feed-gsi1-paging`
- Forecast authored lines: about 350
- Delivery strategy: ask-on-risk
- Checks: `pnpm --filter server test` 40 suites, 257 tests passed. `pnpm --filter server typecheck` passed. `pnpm --filter server lint` passed.
- Commit: pending. User asked to implement, not to commit.

## Next step

Commit on `feat/feed-gsi1-paging` when the user asks, then open a pull request.
