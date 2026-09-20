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
- [x] **T2** — domain-tdd — Media domain + unit (+ property) — route: delegated — commit: `940df87f26794a4dad50bd8cd32c3e7d51a735cd`
- [x] **T3** — ports-adapters — MediaFileRepository + object store ports; in-memory + Dynamo + S3 adapters — route: delegated — commit: `7734c29192a095d456cfd1684cebd2c04b8f88f6`
- [x] **T4** — use-cases-wire — wire controllers/services; characterization green; delete storage remnant in T6 — route: delegated — commit: `35a1bbddffaca492118d135f42973b95b9b5615a`
- [x] **T5** — integration — `media.integration.spec.ts` DynamoDB Local — route: delegated — commit: `75efd918c5213849c7f7079ff8f92462aa1cd6cb`
- [x] **T6** — docs-finalize — CONTEXT glossary; standards; guides; delete `repositories/storage.ts` — route: delegated — commit: `75efd918c5213849c7f7079ff8f92462aa1cd6cb`

## Acceptance

- Unused remnant repos gone; docs no longer say “leave remnant”
- Characterization involving uploads green
- Controllers/services call Media facade (not deepen legacy storage repo for Media paths)
- HTTP `secure_url` contract unchanged

## Progress

- Authorized: cleanup + Media (2026-09-20)
- Branch: `feat/ddd-media` (from main @ `3ea8d99`)
- Mapping (Media): live path `controllers/storage` + `services/storage` (re-export) → `modules/media` → Dynamo FILE# + S3/memory object store
- T0–T6 complete on branch; unit **22/158**; integration **4/10** (Docker DynamoDB Local)
- CONTEXT Media remains **In progress** until tracker PR merges (then mark Done)

## Delivery

- Strategy: **feature-branch-chain** (mirror Identity/Comments; ~2200 authored lines vs main)
- Review boundary: branch point = main
- Suggested slices (not opened yet):
  1. T0 cleanup — `be2080d`
  2. T1 docs — `13247dd`
  3. T2 domain — `940df87`
  4. T3 ports — `7734c29`
  5. T4 wire — `35a1bbd` (likely size:exception)
  6. T5+T6 integration/docs — `75efd91`
- Next: push + open chained PRs when user asks; then mark Media Done in CONTEXT

## Applicable checks

- `pnpm --filter server test` — 22/158 green
- `pnpm --filter server test:integration` — 4/10 green
- `pnpm typecheck` / lint as touched
