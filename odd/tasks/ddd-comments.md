# Feature: DDD Comments bounded context

## Objective

Migrate the Comments bounded context to hexagonal DDD, mirroring Feed (`server/modules/feed/`), with unit/property tests and optional DynamoDB Local integration.

## Problem

Comments are legacy layered CRUD: controller → repository (no service). Domain rules and Feed attach orchestration live in the controller. Feed already owns `Post.comments[]` attach; Comment record has no BC yet.

## Why

User-authorized next strangler BC after Feed (PR #37). Closes the incomplete Feed↔Comments seam.

## Scope

- In: Comments BC under `server/modules/comments/` (Comment aggregate, use cases, Dynamo adapter, thin controller wire)
- Create flow keeps Feed `attachCommentToPostService` + hydrated Post response
- Out: HTTP contract changes, ownership on update/delete, detach-on-delete, Scan→GSI, client, Auth/Social/Media/Items BCs, domain events

## Constraints

- Keep characterization suite green (`comments.characterization.test.ts`, posts comments)
- No HTTP shape/status changes
- TDD for new domain behavior
- English-only artifacts
- Do not store `postId` on COMMENT items (current data model)

## TDD

- Mode: on (project base-standards + Feed precedent)
- Source: docs/base-standards.md + this feature
- Runner: `pnpm --filter server test` / `test:integration`
- Seams (mirror Feed):
  1. Domain aggregate (`Comment.create` / update description)
  2. Use cases + in-memory `CommentRepository` (Feed attach as port/spy)
  3. Existing HTTP characterization (safety net)
  4. Optional Dynamo Local integration

## Route

Delegated direct after explore mapping (Comments legacy map). Per-task routes recorded below.

## Checklist

- [x] T1 docs-scaffold — CONTEXT Comments in-progress; Feed status update; ADR 0002; module barrels; backend-standards — route: delegated — commit: 114ea055ba30e8af06d60a0c7eb4f0a502507bc9
- [x] T2 domain-tdd — Comment aggregate + unit + fast-check — route: delegated — commit: a6359cd968fa6a303e43886f056dbdf9706699f7
- [x] T3 ports-adapters — CommentRepository port, in-memory, Dynamo adapter — route: delegated — commit: 9b1df6f5a17f0250af1862b4e038fe56277f7c6c
- [x] T4 use-cases-wire — CRUD + create orchestrates Feed attach; wire controllers; characterization green — route: delegated — commit: PENDING
- [ ] T5 integration-docker — DynamoDB Local comment specs (reuse Feed Testcontainers) — route: delegated
- [ ] T6 docs-finalize — CONTEXT glossary complete; standards; development_guide cross-links — route: delegated

## Acceptance

- Characterization comments + posts suites green
- Domain unit + property tests green
- Controllers call Comments facade (no direct repo for Comments paths)
- Create still returns hydrated Post via Feed
- Optional: integration green with Docker

## Progress

- Branch: `feat/ddd-comments` from `main` @ `2ece34c`
- Mapping: explore agent (Comments feature map)
- T1: docs-scaffold complete (route: delegated); commit SHA recorded on checklist after commit
- T2: Comment aggregate + unit/property tests green (`pnpm --filter server test` 12 suites / 72 tests); empty names allowed (validators: exists+isString); no postId on aggregate
- T3: CommentRepository port + InMemory + Dynamo adapters green (`pnpm --filter server test` 13 suites / 77 tests); no `update()` on port; `list()` unsorted (legacy Scan); Dynamo item shape matches `repositories/comments.ts` (`userId` ↔ `authorId`)
- T4: use cases + composition facade + thin comments/posts controllers; `pnpm --filter server test` 14 suites / 89 tests (characterization green); legacy `repositories/comments.ts` left unused (strangler, like posts); `updateNames` on Comment for legacy name patches; create orchestrates Feed attach via injectable ports

## Delivery

- Strategy: feature-branch-chain
- Forecast authored lines: ~800–1200 (similar to Feed slice)
- Running authored lines: ~1100 (T1–T4; exact from commits after T4 SHA)
