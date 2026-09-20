# ADR 0001: Feed bounded context — hexagonal DDD

## Status

Accepted

## Context

The Share Social Media backend is a layered Express + DynamoDB API. Posts logic lives in controllers and services without an explicit domain model. Characterization tests lock HTTP behavior. The team authorized migrating the Posts/Feed area to Domain-Driven Design with a robust test pyramid.

## Decision

Introduce a **Feed** bounded context under `server/modules/feed/` using hexagonal architecture:

- **Domain:** `Post` aggregate (likes map, comment id list, create/toggleLike/attachCommentId).
- **Application:** use cases + ports (`PostRepository`) + read assembler for hydrated HTTP views.
- **Infrastructure:** DynamoDB adapter reusing single-table key helpers (`server/db/keys.ts`).
- **Presentation:** existing Express controllers become thin adapters calling the Feed facade.

HTTP contracts remain unchanged. Legacy characterization tests stay the safety net. New domain unit and property-based tests drive the aggregate. Integration tests use DynamoDB Local via Testcontainers (Docker allowed for tests only).

Other domains (Identity, Social graph, Media, Items) remain legacy until separately migrated.

## Consequences

- New Posts work lands in `server/modules/feed/`, not in ad-hoc service functions.
- Controllers must not contain like/create business rules.
- Docs (`CONTEXT.md`, backend-standards) mark Feed as DDD in progress and other BCs as legacy.
- CI may add a Docker-dependent `test:integration` script; the default `test` script keeps memory-backed characterization + unit tests.
