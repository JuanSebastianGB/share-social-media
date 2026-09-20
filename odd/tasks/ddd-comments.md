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
- [ ] T2 domain-tdd — Comment aggregate + unit + fast-check — route: delegated
- [ ] T3 ports-adapters — CommentRepository port, in-memory, Dynamo adapter — route: delegated
- [ ] T4 use-cases-wire — CRUD + create orchestrates Feed attach; wire controllers; characterization green — route: delegated
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

## Delivery

- Strategy: ask-on-risk
- Forecast authored lines: ~800–1200 (similar to Feed slice; may hit ~400 budget → ask chain strategy when exceeded)
- Running authored lines: 0
