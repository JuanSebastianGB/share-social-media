# Feature: DDD Posts/Feed + Robust Tests

## Objective

Migrate the Posts/Feed bounded context to hexagonal DDD and add a robust test pyramid (unit, property-based, integration via DynamoDB Local).

## Problem

Backend is layered CRUD with thin services; domain rules (likes, post invariants) live in services/controllers without a clear aggregate boundary. Tests are characterization-only.

## Why

User-authorized critical task: DDD + robust tests (qa-expert strategy); Docker allowed for integration tests.

## Scope

- In: Feed BC under `server/modules/feed/` (Post aggregate, use cases, Dynamo adapter, tests)
- Out: Auth, friends, Comment aggregate, Items, client, HTTP contract changes, domain events

## Constraints

- Keep characterization suite green
- No HTTP shape/status changes
- TDD for new domain behavior
- English-only artifacts

## TDD

- Mode: on (project base-standards + plan)
- Source: plan + docs/base-standards.md
- Runner: `pnpm --filter server test` / `test:integration`

## Route

Direct implementation after plan exploration (mapping done in plan mode).

## Checklist

- [x] T1 docs-scaffold — CONTEXT.md, ADR, module barrels, backend-standards Feed in-progress — `0ae004e`
- [x] T2 domain-tdd — Post aggregate + unit + fast-check — `501e6b1`
- [x] T3 ports-adapters — port, memory fake, Dynamo adapter — (included in `4a12295`)
- [x] T4 use-cases-wire — use cases + wire controllers; characterization green — `4a12295`
- [x] T5 integration-docker — Testcontainers + integration specs + script — pending commit
- [x] T6 docs-finalize — development_guide + standards Docker-for-tests — pending commit

## Acceptance

See plan acceptance criteria — verified: characterization 54 passed; domain tests passed; integration 1 passed with Docker.

## Progress

- Feature branch `feat/ddd-posts-feed`
- All plan todos complete pending final docs/integration commit

## Delivery

- Strategy: ask-on-risk
- Running authored lines: multi-commit feature branch
