# Feature: DDD Catalog (Items) bounded context

## Objective

Migrate Catalog (Items) demo CRUD from legacy controller→repository into a hexagonal DDD BC under `server/modules/catalog/`, mirroring Feed/Comments/Identity/Media/Social. Delete the last `server/repositories/items.ts` remnant when wired.

## Problem

Items is the last Legacy BC: `controllers/items.ts` calls `repositories/items.ts` directly (documented layering violation). CONTEXT lists Catalog (Items) as Legacy demo. No service/facade; thin HTTP characterization (`health.test.ts` list only).

## Why

User-authorized 2026-09-20 (“follow with catalog”) after Social graph Done (PRs #60–#66). Completes the server strangler for remaining BCs in CONTEXT.

## Scope

- In: Catalog BC under `server/modules/catalog/` (`CatalogItem` aggregate; CRUD use cases; ports; Dynamo + in-memory adapters; thin `controllers/items.ts` wire; delete `repositories/items.ts` on finalize)
- Keep Dynamo shape: `ITEM#id` / `META`, Scan list, fields `_id`/`name`/`active`/timestamps
- Keep HTTP middleware: cache on `GET /items`, JWT + admin role on `POST`, validators as today
- Out: HTTP contract changes, OpenAPI “fix” of create `{ newItem }` wrapper (lock reality), client, domain events, GSI for list, soft-delete

## Constraints

- Characterization / health list green; expand Items characterization where needed
- No intentional HTTP shape/status changes
- TDD for new Catalog domain behavior
- English-only artifacts

## TDD

- Mode: on (project base-standards + prior BC precedent)
- Source: docs/base-standards.md + this feature
- Runner: `pnpm --filter server test` / `test:integration`
- Seams:
  1. Domain aggregate (`CatalogItem` create / update invariants)
  2. Use cases + in-memory `CatalogItemRepository`
  3. HTTP characterization (list + CRUD safety net)
  4. DynamoDB Local integration

## Route

Delegated direct after Catalog legacy map (explore agent). Per-task routes recorded below.

## Checklist

- [x] **T1** — docs-scaffold — CONTEXT Catalog in-progress; ADR 0006; module barrels; backend-standards — route: delegated — commit: 2442cd0
- [x] **T2** — domain-tdd — CatalogItem aggregate + unit (+ property) — route: delegated — commit: bb5932f
- [x] **T3** — ports-adapters — CatalogItemRepository + in-memory + Dynamo (`ITEM#`) — route: delegated — commit: 3d0578e
- [x] **T4** — use-cases-wire — CRUD facade; thin controller; expand characterization; keep cache/role — route: delegated — commit: e4279d4
- [x] **T5** — integration — `catalog.integration.spec.ts` DynamoDB Local — route: delegated — commit: `ea6361de4b59baaf4543e8371c1f4ae3df25ea7e`
- [x] **T6** — docs-finalize — CONTEXT glossary; standards; delete `repositories/items.ts`; mark Done after merge — route: delegated — commit: `ea6361de4b59baaf4543e8371c1f4ae3df25ea7e`

## Acceptance

- Controllers call Catalog facade (not `repositories/items` directly)
- Domain unit + property tests green
- HTTP contracts unchanged (including `{ newItem }` create wrapper, 200+null get miss, Update/DeleteResult shapes)
- `repositories/items.ts` removed after wire
- Optional: integration green with Docker

## Progress

- Authorized: Catalog (2026-09-20)
- Branch: `feat/ddd-catalog` (from main @ `9bcc11a`)
- Mapping: `routes/items` → `controllers/items` → `repositories/items` → `ITEM#` / Scan; no cross-BC coupling; public cached list; admin POST
- Approach: module `catalog/`, aggregate `CatalogItem` (CONTEXT language)
- T1: docs/scaffold complete (route: delegated); ADR 0006 + `modules/catalog` barrels; no glossary yet (T6); commit `2442cd0`
- T2: domain-tdd complete (route: delegated)
  - RED: `pnpm --filter server test -- --testPathPattern='catalog/domain/catalog-item'` — 2 suites failed (TS2307 Cannot find module `./catalog-item.js` / `./errors.js`)
  - GREEN: same pattern — 2 suites / 18 tests passed; full `pnpm --filter server test` — 28 suites / 190 tests passed
  - Delivered: `errors.ts`, `catalog-item.ts` (create/reconstitute/rename/setActive/toSnapshot), unit + fast-check property tests; barrels export aggregate + errors + types; no applyPatch; no HTTP 5–20 length in domain
  - Commit: `bb5932f`
- T3: ports-adapters complete (route: delegated)
  - GREEN: in-memory adapter — 1 suite / 5 tests; full `pnpm --filter server test` — 29 suites / 195 tests passed
  - Delivered: `CatalogItemRepository` port (save/findById/list/delete); `InMemoryCatalogItemRepository` + unit tests; `DynamoCatalogItemRepository` Put-based save + ITEM# Scan list; barrels updated; no controller wire; legacy `repositories/items.ts` kept
  - Commit: `3d0578e`
- T4: use-cases-wire complete (route: delegated); commit `e4279d4`
- T5: `catalog.integration.spec.ts` (repo save/find/list/delete, composition CRUD, HTTP GET/POST/PUT/DELETE + ITEM# oracles); commit `ea6361de4b59baaf4543e8371c1f4ae3df25ea7e`
- T6: CONTEXT Catalog glossary + invariants (status remains **In progress**); data-model / backend-standards / development_guide / ADR 0006 consequences updated; `server/repositories/items.ts` deleted; commit `ea6361de4b59baaf4543e8371c1f4ae3df25ea7e`
- Shipped: tracker #67 merged to main; children #68–#72 merged tip-down
- CONTEXT Catalog marked Done (follow-up docs commit)

## Delivery

- Strategy: **feature-branch-chain** (mirror Social/Media)
- Forecast authored lines: ~900–1300
- Running authored lines: ~1706 (T1–T6)
- Review boundary: branch point = main
- Tracker PR: **#67** `feat/ddd-catalog` → `main`
- Child review slices (nested bases for clean diffs):
  1. `feat/ddd-catalog-01-docs` → `main` — T1 — **#68** (~149)
  2. `feat/ddd-catalog-02-domain` → `feat/ddd-catalog-01-docs` — T2 — **#69** (~389)
  3. `feat/ddd-catalog-03-ports` → `feat/ddd-catalog-02-domain` — T3 — **#70** (~268)
  4. `feat/ddd-catalog-04-wire` → `feat/ddd-catalog-03-ports` — T4 — **#71** (~488, size:exception)
  5. `feat/ddd-catalog-05-integration-docs` → `feat/ddd-catalog-04-wire` — T5+T6 — **#72** (~486, size:exception)
- Merge: review children; ship via tracker #67 → main; then mark Catalog Done in CONTEXT
- Shipped: tracker #67 merged to main; children #68–#72 merged tip-down
- CONTEXT Catalog marked Done (follow-up docs commit)

## Applicable checks

- `pnpm --filter server test`
- `pnpm --filter server test:integration` (T5)
- `pnpm typecheck` / lint as touched
