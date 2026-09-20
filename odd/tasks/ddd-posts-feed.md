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

Delegated/direct hybrid: parent orchestrates; implementation inline after exploration (plan already mapped).

## Checklist

- [ ] T1 docs-scaffold — CONTEXT.md, ADR, module barrels, backend-standards Feed in-progress
- [ ] T2 domain-tdd — Post aggregate + unit + fast-check
- [ ] T3 ports-adapters — port, memory fake, Dynamo adapter
- [ ] T4 use-cases-wire — use cases + wire controllers; characterization green
- [ ] T5 integration-docker — Testcontainers + integration specs + script
- [ ] T6 docs-finalize — development_guide + standards Docker-for-tests

## Acceptance

See plan acceptance criteria.

## Progress

- Created feature branch `feat/ddd-posts-feed`
- Next: T1 docs-scaffold

## Delivery

- Strategy: ask-on-risk
- Forecast: ~800–1200 authored lines (multi-slice; expect chain if over ~400)
