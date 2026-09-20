# ADR 0004: Media bounded context — hexagonal DDD

## Status

Accepted

## Context

The Share Social Media backend is a layered Express + DynamoDB API. Media logic lived in legacy utilities: `services/storage.ts` orchestrated `repositories/storage.ts` for `FILE#` DynamoDB items and `utilities/s3Upload` for upload side effects that set `req.image.secure_url`. Characterization tests lock HTTP behavior on `/storage` and the legacy `/defaulstorage` typo path. Feed, Comments, and Identity already migrated to hexagonal DDD (ADR 0001, ADR 0002, ADR 0003). After remnant repository cleanup, the team authorized migrating the Media area next.

## Decision

Introduce a **Media** bounded context under `server/modules/media/` using hexagonal architecture:

- **Domain:** `MediaFile` aggregate (`id`, `fileName`, `url`, soft-delete flag). No S3 I/O in the domain.
- **Application:** use cases + ports (`MediaFileRepository`); hard-delete may orchestrate an optional object-store side effect outside the domain.
- **Infrastructure:** DynamoDB single-table adapter for `FILE#` items reusing key helpers (`server/db/keys.ts`); S3/memory object helpers stay adapter/infra (may wrap existing `s3Upload`).
- **Presentation:** existing Express controllers become thin adapters calling the Media facade; `services/storage.ts` becomes a re-export facade like `services/auth.ts` / `services/users.ts`.

HTTP contracts remain unchanged, including the `/defaulstorage` typo path. Legacy characterization tests stay the safety net. New domain unit and property-based tests drive the aggregate where justified. Integration tests may use memory media endpoint or DynamoDB Local via Testcontainers (Docker allowed for tests only).

Out of scope for this migration: Social graph extract, Catalog (Items), the client, CloudFront infra changes, and domain events.

## Consequences

- New Media work lands in `server/modules/media/`, not in ad-hoc controller → service → repository deepening.
- Controllers must not contain file metadata create/update/delete business rules once wired; call the Media facade (`modules/media` / thin `services/storage.ts` re-export).
- Docs (`CONTEXT.md`, backend-standards) describe the Media hexagonal BC; CONTEXT Media is marked **Done** after the feature PR merges (same as Feed/Comments/Identity).
- Soft-delete stays a domain concern; object-store hard-delete is application/infra orchestration.
- Legacy `server/repositories/storage.ts` was deleted after Media wire; do not revive it.
- Characterization (storage/posts/auth that touch media) plus Media module unit/property tests and `media.integration.spec.ts` (DynamoDB Local) lock behavior.
