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
- [ ] **T3** — ports-adapters — CatalogItemRepository + in-memory + Dynamo (`ITEM#`) — route: delegated
- [ ] **T4** — use-cases-wire — CRUD facade; thin controller; expand characterization; keep cache/role — route: delegated
- [ ] **T5** — integration — `catalog.integration.spec.ts` DynamoDB Local — route: delegated
- [ ] **T6** — docs-finalize — CONTEXT glossary; standards; delete `repositories/items.ts`; mark Done after merge — route: delegated

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
  - Commit: PENDING
- Next: T3 ports-adapters

## Delivery

- Strategy: **feature-branch-chain** (mirror Social/Media)
- Forecast authored lines: ~900–1300
- Running authored lines: ~450 (T1+T2)
- Review boundary: branch point = main
- Tracker / child PRs: open after T1–T6 on branch

## Applicable checks

- `pnpm --filter server test`
- `pnpm --filter server test:integration` (T5)
- `pnpm typecheck` / lint as touched
