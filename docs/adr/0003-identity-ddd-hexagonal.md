# ADR 0003: Identity bounded context — hexagonal DDD

## Status

Accepted

## Context

The Share Social Media backend is a layered Express + DynamoDB API. Auth and user/profile logic live in controllers and services calling `repositories/users.ts`. Session middleware and Feed hydration import the users repository directly. Friends are embedded as `friends: string[]` on the USER item while CONTEXT documents Social graph as a separate bounded context. Characterization tests lock HTTP behavior. Feed and Comments already migrated to hexagonal DDD (ADR 0001, ADR 0002). The team authorized migrating the Identity area next, keeping friends on the User aggregate for this slice (approach B).

## Decision

Introduce an **Identity** bounded context under `server/modules/identity/` using hexagonal architecture:

- **Domain:** `User` aggregate including profile fields, optional `cognitoSub` / password dual-mode persistence concerns, and **`friends[]` toggle** for this slice (approach B — Social graph stays documented as its own CONTEXT BC but is not extracted yet).
- **Application:** use cases + ports (`UserRepository`); Cognito link create/lookup lives in the Dynamo adapter (or a dedicated link port wired through the same facade).
- **Infrastructure:** DynamoDB single-table adapters reusing key helpers (`server/db/keys.ts`) for `USER#id` / `PROFILE` and `COGNITO#sub` / `LINK`.
- **Presentation:** existing Express controllers become thin adapters calling the Identity facade.

HTTP contracts remain unchanged. Legacy characterization tests stay the safety net. New domain unit and property-based tests drive the aggregate. Integration tests may use DynamoDB Local via Testcontainers (Docker allowed for tests only).

Out of scope for this migration: Media avatar ownership, Catalog (Items), extracting a Social graph module, and the client. Dual-mode auth (HS256 local/Jest vs Cognito when env is set) stays explicit.

## Consequences

- New Identity work lands in `server/modules/identity/`, not in ad-hoc controller → service → repository deepening.
- Controllers must not contain register/login/profile/friend business rules once wired.
- Docs (`CONTEXT.md`, backend-standards) mark Identity as DDD in progress; Comments and Feed as done/migrated.
- Friends remain on the User aggregate until a later Social graph extract; CONTEXT keeps Social graph listed separately so the eventual split stays visible.
- Legacy `server/repositories/users.ts` may remain as an unused strangler remnant until deleted in a follow-up after wire.
