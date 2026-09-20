# ADR 0002: Comments bounded context — hexagonal DDD

## Status

Accepted

## Context

The Share Social Media backend is a layered Express + DynamoDB API. Comments logic lives in controllers calling repositories directly (no service layer). Create-comment orchestration attaches the new comment id to a Post via Feed (`attachCommentToPostService`) and returns a hydrated Post. Characterization tests lock HTTP behavior. Feed already migrated to hexagonal DDD (ADR 0001). The team authorized migrating the Comments area next.

## Decision

Introduce a **Comments** bounded context under `server/modules/comments/` using hexagonal architecture:

- **Domain:** `Comment` aggregate (`description`, author id, `firstName`, `lastName`; no `postId` on the item).
- **Application:** use cases + ports (`CommentRepository`); create orchestrates Feed `attachCommentToPost` (or equivalent facade) then returns the hydrated Post response shape.
- **Infrastructure:** DynamoDB adapter reusing single-table key helpers (`server/db/keys.ts`).
- **Presentation:** existing Express controllers become thin adapters calling the Comments facade.

HTTP contracts remain unchanged. Legacy characterization tests stay the safety net. New domain unit and property-based tests drive the aggregate. Integration tests may use DynamoDB Local via Testcontainers (Docker allowed for tests only).

Other domains (Identity, Social graph, Media, Items) remain legacy until separately migrated. Feed remains the owner of `Post.comments[]` attach semantics.

## Consequences

- New Comments work lands in `server/modules/comments/`, not in ad-hoc controller → repository skips.
- Controllers must not contain comment create/update business rules or Feed attach orchestration.
- Docs (`CONTEXT.md`, backend-standards) describe the Comments hexagonal BC; CONTEXT keeps Comments **In progress** until the feature PR merges (Feed was marked Done after its merge).
- Create continues to return a hydrated Post via Feed; Comment records stay linked only through `Post.comments[]`.
- Legacy `server/repositories/comments.ts` may remain as an unused strangler remnant until deleted in a follow-up.
