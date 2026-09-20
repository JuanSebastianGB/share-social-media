# ADR 0005: Social graph bounded context — hexagonal DDD

## Status

Accepted

## Context

The Share Social Media backend is a layered Express + DynamoDB API. Friendship rules live inside the Identity bounded context: `User.toggleFriend`, `toggleFriendship`, and the users-service friends paths (`getUserFriendsService` / `toggleRelationFriendService`). Friends remain embedded as `friends: string[]` on the USER DynamoDB item (Identity approach B from ADR 0003). CONTEXT already lists Social graph as a separate bounded context. Feed, Comments, Identity, and Media are migrated to hexagonal DDD (ADR 0001–0004). After Media Done, the team authorized extracting Social graph next.

## Decision

Introduce a **Social graph** bounded context under `server/modules/social/` using hexagonal architecture:

- **Domain:** `FriendList` aggregate owning friendship toggle/list invariants for a user. No new Friend entity type in DynamoDB.
- **Application:** use cases + ports (`FriendListRepository`) that still persist mutual friendship as `friends[]` on USER items (no `FRIEND#` edge items).
- **Infrastructure:** DynamoDB single-table adapters that read/write the existing USER `friends` field via key helpers (`server/db/keys.ts`).
- **Presentation:** existing Express users controllers become thin adapters calling the Social facade; friendship mutation moves out of Identity once wired. Identity may keep `friends[]` on User snapshots for profile/Feed hydration reads.

HTTP contracts remain unchanged (`PATCH /users/:id/:friendId`, `GET /users/:id/friends`). Legacy characterization tests stay the safety net. New domain unit and property-based tests drive the aggregate where justified. Integration tests may use DynamoDB Local via Testcontainers (Docker allowed for tests only).

Out of scope for this migration: Catalog (Items), the client, domain events, and introducing new friendship edge items.

## Consequences

- New Social graph work lands in `server/modules/social/`, not by deepening Identity friendship use cases.
- Controllers must not contain friendship toggle/list business rules; call the Social facade (`modules/social` / thin `services/users.ts` friends re-exports).
- Docs (`CONTEXT.md`, backend-standards) describe the Social hexagonal BC; CONTEXT Social is marked **Done** after the feature PR merges (same as Feed/Comments/Identity/Media).
- Dynamo shape stays embedded `friends: string[]` on USER; do not introduce `FRIEND#` edges in this migration.
- Identity no longer owns friendship mutation (`User.toggleFriend` removed); Identity may keep `friends[]` on User snapshots for profile/Feed hydration reads.
- Characterization (`users`) plus Social module unit/property tests and `social.integration.spec.ts` (DynamoDB Local) lock behavior.
