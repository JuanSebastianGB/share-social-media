# Feature: DDD Social graph bounded context

## Objective

Extract friendship from Identity into a Social graph hexagonal BC under `server/modules/social/`, mirroring Feed/Comments/Identity/Media.

## Problem

Friendship rules (`User.toggleFriend`, `toggleFriendship`, `getUserFriendsService` / `toggleRelationFriendService`) live inside Identity. CONTEXT lists Social graph as a separate BC still marked Legacy. Friends remain `string[]` on the USER Dynamo item (Identity approach B).

## Why

User-authorized 2026-09-20 after Media Done (PRs #51–#58). Natural next strangler BC; Catalog (Items) stays lower priority demo CRUD.

## Scope

- In: Social BC under `server/modules/social/` (`FriendList` aggregate, toggle + list-friends use cases, ports/adapters that still persist `friends[]` on USER items, thin wire from users controller/services)
- Keep Dynamo shape: embedded `friends: string[]` on USER (no `FRIEND#` edge items)
- Move toggle domain rules out of Identity `User`; Identity keeps `friends[]` on snapshots for profile/Feed hydration reads
- Out: new Dynamo friendship edges, HTTP contract changes, Catalog/Items, client Redux, domain events, ownership/privacy rules beyond current toggle

## Constraints

- Characterization green (`users.characterization.test.ts`; identity integration friends cases migrate or stay green)
- No HTTP shape/status changes (`PATCH /users/:id/:friendId`, `GET /users/:id/friends`)
- TDD for new Social domain behavior
- English-only artifacts

## TDD

- Mode: on (project base-standards + prior BC precedent)
- Source: docs/base-standards.md + this feature
- Runner: `pnpm --filter server test` / `test:integration`
- Seams:
  1. Domain aggregate (`FriendList` create / toggleFriend invariants)
  2. Use cases + in-memory `FriendListRepository`
  3. Existing HTTP characterization (safety net)
  4. Optional Dynamo Local integration

## Route

Delegated direct after explore mapping (Social legacy map). Per-task routes recorded below.

## Checklist

- [x] **T1** — docs-scaffold — CONTEXT Social in-progress; ADR 0005; module barrels; backend-standards — route: delegated — commit: `3a001093ed7344a6d418f07c47b56f70d23cca6a`
- [x] **T2** — domain-tdd — FriendList aggregate + unit (+ property) — route: delegated — commit: `3c1be024fbf33bac988cd07c69fb41ff89fb502d`
- [x] **T3** — ports-adapters — FriendListRepository + in-memory + Dynamo (USER.friends field) — route: delegated — commit: `dfdea9457e283ce8b3d0e7a694cacaaff8371860`
- [x] **T4** — use-cases-wire — toggle + list friends; wire controllers/services; strip Identity toggle; characterization green — route: delegated — commit:
- [ ] **T5** — integration — DynamoDB Local social specs (friends toggle HTTP/DB) — route: delegated
- [ ] **T6** — docs-finalize — CONTEXT glossary; standards; guides; mark Done after merge — route: delegated

## Acceptance

- Characterization users (+ identity friends coverage) green
- Domain unit + property tests green
- Friend toggle/list call Social facade (not Identity use case)
- Identity `User` no longer owns toggleFriend domain mutation (friends[] may remain on snapshot for reads)
- HTTP contracts unchanged
- Optional: integration green with Docker

## Progress

- Authorized: Social graph (2026-09-20)
- Branch: `feat/ddd-social-graph` (from main)
- Mapping: `PATCH /users/:id/:friendId` → `controllers/users.toggleRelationFriend` → `services/users` → Identity `toggleRelationFriendService` → `toggleFriendship` → `User.toggleFriend` ×2 → USER `friends[]`
- Approach: keep embedded `friends[]` on USER; Social owns FriendList + bidirectional toggle (explore recommendation)
- T1: docs/scaffold complete (route: delegated); ADR 0005 + `modules/social` barrels; no glossary yet (T6); commit pending parent
- T2: FriendList domain + unit/property tests green (route: delegated); Identity `User.toggleFriend` still present (T4); commit pending parent
- T3: FriendListRepository port + InMemory + Dynamo adapters (UpdateCommand SET friends/updatedAt only; no Cognito writes; missing USER throws); in-memory unit tests green; commit SHA blank pending parent
- T4: Social `toggleFriendship` + composition `getUserFriendsService` / `toggleRelationFriendService`; `services/users.ts` wires friends from Social; Identity stripped of toggle use case + `User.toggleFriend`; identity.integration friends cases call Social facade; characterization green; commit SHA blank pending parent
- Next: T5 integration

## Delivery

- Strategy: **feature-branch-chain** (mirror Identity/Media/Comments)
- Forecast authored lines: ~1000–1400
- Review boundary: branch point = main
- Tracker / child PRs: open after T1–T6 on branch (same nested-slice pattern as prior BCs)

## Applicable checks

- `pnpm --filter server test`
- `pnpm --filter server test:integration` (T5)
- `pnpm typecheck` / lint as touched
