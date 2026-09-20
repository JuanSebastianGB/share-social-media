# Feature: DDD Media bounded context (+ remnant cleanup)

## Objective

1. Delete unused strangler remnant repositories (`users`, `comments`, `posts`).
2. Migrate the Media bounded context to hexagonal DDD under `server/modules/media/`, mirroring Feed/Comments/Identity.

## Problem

Media uploads were legacy utilities (`services/storage.ts` → `repositories/storage.ts` → S3/memory). Feed/Comments/Identity already migrated. Media is now wired through `server/modules/media/`; CONTEXT status stays In progress until PR merge.

## Why

User-authorized 2026-09-20: small cleanup first, then Media strangler BC after Identity Done.

## Scope

- In: delete unused `server/repositories/{users,comments,posts,storage}.ts`; update docs/ADRs; Media BC under `server/modules/media/` (domain + ports + adapters + thin controller/service wire); characterization green; DynamoDB Local integration
- Out: Social graph extract, Catalog/Items, client Redux, HTTP contract changes, CloudFront infra changes, domain events

## Constraints

- Keep characterization suites green (storage/posts/auth that touch media URLs)
- No HTTP shape/status changes (`req.image.secure_url` contract)
- TDD for new Media domain behavior
- English-only artifacts
- `MEDIA_ENDPOINT=memory` local/test path preserved

## TDD

- Mode: on (project base-standards + Feed/Comments/Identity precedent)
- Source: docs/base-standards.md + this feature
- Runner: `pnpm --filter server test` / `test:integration`
- Seams (mirror prior BCs; confirm on Media map):
  1. Domain aggregate / value object for media file metadata
  2. Use cases + in-memory port
  3. Existing HTTP characterization (safety net)
  4. Optional integration (memory endpoint or Testcontainers if Dynamo metadata applies)

## Route

Delegated direct after Media legacy map. Per-task routes recorded below.

## Checklist

- [x] **T0** — remnant-cleanup — delete unused `repositories/{users,comments,posts}.ts`; update standards/ADRs/CONTEXT wording — route: inline — commit: `be2080d3643f225419ef03474465d293c73801de`
- [x] **T1** — docs-scaffold — CONTEXT Media in-progress; ADR 0004; module barrels; backend-standards — route: delegated — commit: `13247dd77b150e35e56a3737af273581240d4409`
- [x] **T2** — domain-tdd — Media domain + unit (+ property) — route: delegated — commit: pending (parent)
- [x] **T3** — ports-adapters — MediaFileRepository + object store ports; in-memory + Dynamo + S3 adapters — route: delegated — commit: pending (parent)
- [x] **T4** — use-cases-wire — wire controllers/services; characterization green; leave storage remnant unused — route: delegated — commit: pending (parent)
- [x] **T5** — integration — `media.integration.spec.ts` DynamoDB Local — route: delegated — commit: pending (parent)
- [x] **T6** — docs-finalize — CONTEXT glossary; standards; guides; delete `repositories/storage.ts` — route: delegated — commit: pending (parent)

## Acceptance

- Unused remnant repos gone; docs no longer say “leave remnant”
- Characterization involving uploads green
- Controllers/services call Media facade (not deepen legacy storage repo for Media paths)
- HTTP `secure_url` contract unchanged

## Progress

- Authorized: cleanup + Media (2026-09-20)
- Branch: `feat/ddd-media` (from main @ `3ea8d99`)
- Mapping (Media): live path `controllers/storage` + `services/storage` (re-export) → `modules/media` → Dynamo FILE# + S3/memory object store
- T0: remnant cleanup complete (route: inline); suite **18/126** green; commit `be2080d3643f225419ef03474465d293c73801de`
- T1: docs/scaffold complete (route: delegated); ADR 0004 + `modules/media` barrels; commit `13247dd77b150e35e56a3737af273581240d4409`
- T2–T4: domain, ports, wire — commit pending parent
- T5+T6: integration + docs finalize; `repositories/storage.ts` deleted; unit **22/158**; integration **4/10** (Docker DynamoDB Local); commit pending parent

## Applicable checks

- `pnpm --filter server test`
- `pnpm --filter server test:integration` (if T5 adds specs)
- `pnpm typecheck` / lint as touched
