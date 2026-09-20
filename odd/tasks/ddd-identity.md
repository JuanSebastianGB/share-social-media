# Feature: DDD Identity bounded context

## Objective

Migrate the Identity bounded context to hexagonal DDD under `server/modules/identity/`, mirroring Feed/Comments, with the User aggregate including friends for this slice (approach B).

## Problem

Auth and user/profile logic are legacy layered: controllers → services → `repositories/users.ts`. Session middleware and Feed hydration import the users repo directly. Friends live on the User DynamoDB item while CONTEXT lists Social graph as a separate BC.

## Why

User-authorized next strangler BC after Comments (PRs #38–#43). Approach B: keep friends on the User aggregate for now; extract Social graph later when friend rules grow.

## Scope

- In: Identity BC under `server/modules/identity/` (User aggregate with friends, Cognito link persistence, use cases, Dynamo adapter, thin controller wire)
- Dual-mode auth preserved (HS256 Jest/local + Cognito when env set)
- Feed assembler / session middleware eventually call Identity facade instead of raw users repo
- Out: HTTP contract changes, Media ownership of avatar upload, dropping HS256 dual-mode, client Redux, Catalog, domain events, extracting Social graph as its own module

## Constraints

- Keep characterization suites green (`auth.characterization.test.ts`, `users.characterization.test.ts`, posts hydration)
- No HTTP shape/status changes
- TDD for new domain behavior
- English-only artifacts
- Friends remain embedded `friends: string[]` on USER item (no Friend entity)

## TDD

- Mode: on (project base-standards + Feed/Comments precedent)
- Source: docs/base-standards.md + this feature
- Runner: `pnpm --filter server test` / `test:integration`
- Seams (mirror Comments):
  1. Domain aggregate (`User` create / toggleFriend / profile fields)
  2. Use cases + in-memory `UserRepository`
  3. Existing HTTP characterization (safety net)
  4. Optional Dynamo Local integration

## Route

Delegated direct after explore mapping (Identity legacy map). Per-task routes recorded below.

## Checklist

- [x] **T1** — docs-scaffold — CONTEXT Identity in-progress; Comments→Done; ADR 0003; module barrels; backend-standards — route: delegated — commit: 2cdb18d2f206cc18fbad46f5d4fdebfc8c887937
- [x] **T2** — domain-tdd — User aggregate + unit + property tests (incl. friend toggle) — route: delegated — commit: f5cc0c24fa27a8d911a3cbcedabbddd41c6fda0e
- [x] **T3** — ports-adapters — UserRepository port, in-memory, Dynamo (+ Cognito link) — route: delegated — commit: 27a70c6f23fa4e2dbf41fd71cc37a6b90e88872a
- [x] **T4** — use-cases-wire — auth + users + friends; wire controllers; Feed/session ACL; characterization green — route: delegated — commit: _(parent)_
- [ ] **T5** — integration-docker — DynamoDB Local identity specs — route: delegated
- [ ] **T6** — docs-finalize — CONTEXT glossary; standards; development_guide cross-links — route: delegated

## Acceptance

- Characterization auth + users (+ posts hydration) green
- Domain unit + property tests green
- Controllers call Identity facade (no direct users repo for Identity paths)
- Legacy `repositories/users.ts` unused remnant after wire (strangler)
- Optional: integration green with Docker

## Progress

- Branch: `feat/ddd-identity` (from main)
- Mapping: parent explore (auth/users/session/Feed assembler)
- Approach B confirmed by user 2026-09-20
- T1: docs-scaffold complete (route: delegated); commit `2cdb18d2f206cc18fbad46f5d4fdebfc8c887937`
- T2: domain-tdd complete (route: delegated) — `User` aggregate with friends[], `InvalidUserError`, unit + property tests; email normalized `trim().toLowerCase()` on create (matches `emailGsi1Pk`); self-friend rejected; `toggleFriend` mutates this aggregate only (JSDoc); no `updateProfile` yet; commit `f5cc0c24fa27a8d911a3cbcedabbddd41c6fda0e`
- T3: ports-adapters complete (route: delegated) — `UserRepository` port (no `update()`); `InMemoryUserRepository` with email/cognitoSub indexes + clear(); `DynamoUserRepository` mirrors USER item + GSI1 email + Scan list; Cognito link Put without ConditionExpression on save (idempotent re-save); delete removes LINK when cognitoSub present; exported from identity barrel; commit `27a70c6f23fa4e2dbf41fd71cc37a6b90e88872a`; suite 17/115
- T4: use-cases-wire complete (route: delegated) — use cases (`registerUser`, `completeProfile`, finders, `listUsers`, `toggleFriendship`) + InMemory tests; composition facade (auth + users hydration + Feed assembler); `services/auth.ts` / `services/users.ts` thin re-exports; session/routes/controllers/Feed off `repositories/users`; remnant left unused; suite **18/126** green; commit SHA blank for parent (size:exception cohesive wire like Comments T4)

## Delivery

- Strategy: **feature-branch-chain** (user 2026-09-20; typed as feature-branch-change)
- Forecast authored lines: ~1400–1600 (Comments-shaped)
- Running authored lines: T1–T3 ~1020/+7; T4 wire slice size:exception OK (cohesive; parent records SHA) — expect ~1500–1800 vs main after T4 commit
- Review boundary: branch point = main
- Planned child slices (mirror Comments):
  1. `feat/ddd-identity-01-docs` — T1
  2. `feat/ddd-identity-02-domain` — T2
  3. `feat/ddd-identity-03-ports` — T3
  4. `feat/ddd-identity-04-wire` — T4 (size:exception cohesive wire)
  5. `feat/ddd-identity-05-integration-docs` — T5+T6
- Next: T5 integration-docker

## Applicable checks

- `pnpm --filter server test`
- `pnpm --filter server test:integration` (T5)
- `pnpm typecheck` / lint as touched
