# ADR 0006: Catalog (Items) bounded context — hexagonal DDD

## Status

Accepted

## Context

The Share Social Media backend is a layered Express + DynamoDB API. Catalog (Items) is the last Legacy demo BC: `controllers/items.ts` calls `repositories/items.ts` directly (documented layering violation). Items use DynamoDB keys `ITEM#id` / `META`, list via Scan, and HTTP middleware (cache on `GET /items`, JWT + admin role on `POST`). Feed, Comments, Identity, Media, and Social graph are migrated to hexagonal DDD (ADR 0001–0005). After Social Done, the team authorized extracting Catalog next.

## Decision

Introduce a **Catalog** bounded context under `server/modules/catalog/` using hexagonal architecture:

- **Domain:** `CatalogItem` aggregate owning item create/update invariants (`name`, `active`, timestamps). No soft-delete in this migration.
- **Application:** CRUD use cases + ports (`CatalogItemRepository`) that preserve existing Dynamo fields (`_id`, `name`, `active`, timestamps).
- **Infrastructure:** DynamoDB single-table adapters (`ITEM#` / `META`, Scan list) plus in-memory adapters for tests; key helpers via `server/db/keys.ts`.
- **Presentation:** existing Express items controllers become thin adapters calling the Catalog facade once wired; delete `repositories/items.ts` on finalize.

HTTP contracts remain unchanged (including create `{ newItem }` wrapper shapes). Cache middleware on `GET /items` and admin role on `POST` stay as today. Legacy characterization / health list tests stay the safety net. New domain unit and property-based tests drive the aggregate where justified. Integration tests may use DynamoDB Local via Testcontainers (Docker allowed for tests only).

Out of scope for this migration: the client, domain events, a GSI for list, soft-delete, and rewriting OpenAPI to “fix” create response wrappers.

## Consequences

- New Catalog work lands in `server/modules/catalog/`, not by deepening `repositories/items.ts`.
- Controllers must not contain Catalog business rules once wired; call the Catalog facade. Until T4 wire, `controllers/items.ts` → `repositories/items.ts` remains the documented violation.
- Docs (`CONTEXT.md`, backend-standards) describe the Catalog hexagonal BC; CONTEXT Catalog is marked **Done** after the feature PR merges (same as prior BCs).
- Dynamo shape stays `ITEM#id` / `META` with Scan list; do not introduce a list GSI or soft-delete in this migration.
- Characterization (items/health list) plus Catalog module unit/property tests and optional `catalog.integration.spec.ts` (DynamoDB Local) lock behavior.
