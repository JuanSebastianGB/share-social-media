# Feature: DDD Media bounded context (+ remnant cleanup)

## Objective

1. Delete unused strangler remnant repositories (`users`, `comments`, `posts`).
2. Migrate the Media bounded context to hexagonal DDD under `server/modules/media/`, mirroring Feed/Comments/Identity.

## Problem

Media uploads remain legacy utilities (`services/storage.ts` → `repositories/storage.ts` → S3/memory). Feed/Identity already migrated; unused legacy repos still sit in the tree. CONTEXT lists Media as legacy.

## Why

User-authorized 2026-09-20: small cleanup first, then Media strangler BC after Identity Done.

## Scope

- In: delete unused `server/repositories/{users,comments,posts}.ts`; update docs/ADRs that call them remnants; Media BC under `server/modules/media/` (domain + ports + adapters + thin controller/service wire); characterization green; optional Dynamo/S3-local or memory integration as appropriate
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

- [x] **T0** — remnant-cleanup — delete unused `repositories/{users,comments,posts}.ts`; update standards/ADRs/CONTEXT wording — route: inline — commit: pending
- [ ] **T1** — docs-scaffold — CONTEXT Media in-progress; ADR 0004; module barrels; backend-standards
- [ ] **T2** — domain-tdd — Media domain + unit (+ property if justified)
- [ ] **T3** — ports-adapters — MediaRepository / storage port, in-memory, S3/Dynamo adapter as mapped
- [ ] **T4** — use-cases-wire — wire controllers/services; characterization green; leave storage remnant unused or delete if fully replaced
- [ ] **T5** — integration — memory or Docker path as mapped
- [ ] **T6** — docs-finalize — CONTEXT glossary; standards; development_guide cross-links

## Acceptance

- Unused remnant repos gone; docs no longer say “leave remnant”
- Characterization involving uploads green
- Controllers/services call Media facade (not deepen legacy storage repo for Media paths)
- HTTP `secure_url` contract unchanged

## Progress

- Authorized: cleanup + Media (2026-09-20)
- Branch: `feat/ddd-media` (from main @ `3ea8d99`)
- Mapping (Media): codegraph — live path `controllers/storage` + `services/storage` → `repositories/storage` (FILE# Dynamo); S3 via `utilities/s3Upload` (`req.image.secure_url`); callers of `deleteHardFileService`: posts/auth controllers + Feed composition; test setup imports storage repo for memory seed
- T0: remnant cleanup complete (route: inline); suite **18/126** green; commit pending
- Seams (confirmed by prior BC pattern + map):
  1. Domain: `MediaFile` aggregate (id, fileName, url, deleted) — softDelete; create; no S3 in domain
  2. Ports: `MediaFileRepository` + optional `ObjectStore` for hard-delete S3 side effect
  3. HTTP characterization safety net
  4. Optional Dynamo Local FILE round-trip integration

## Delivery

- Strategy: **feature-branch-chain** (default; mirror Identity/Comments)
- Forecast authored lines: ~800–1400 (Media smaller than Identity; T0 small)
- Running authored lines: T0 pending count
- Review boundary: branch point = main

## Applicable checks

- `pnpm --filter server test`
- `pnpm --filter server test:integration` (if T5 adds specs)
- `pnpm typecheck` / lint as touched
