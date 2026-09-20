# Domain Context — Share Social Media

This document records the ubiquitous language for the application. Bounded contexts are introduced incrementally (strangler).

## Bounded contexts

| Context | Status | Code |
|---------|--------|------|
| Feed | Done (DDD hexagonal) | `server/modules/feed/` |
| Comments | Done (DDD hexagonal) | `server/modules/comments/` |
| Identity | Done (DDD hexagonal) | `server/modules/identity/` |
| Social graph | In progress (DDD hexagonal) | `server/modules/social/` |
| Media | Done (DDD hexagonal) | `server/modules/media/` |
| Catalog (Items) | Legacy demo | `server/controllers/items.ts` |

## Feed glossary

| Term | Meaning |
|------|---------|
| Post | Aggregate root for feed content. Owns body, author, media reference, likes, and comment id list. |
| Author | The user id that owns a Post (`userId`). |
| Like | Embedded map entry `userId → true` on a Post. Not a separate entity. |
| Feed | Global chronological list of posts via DynamoDB GSI1 (`GSI1PK = FEED`). |
| Comment id | Identifier of a Comment record stored in `Post.comments[]`. Owned by the Comments BC; Feed only stores the id list. |

## Feed invariants (domain)

- A Post always has a non-empty body and an Author.
- Toggle like: if the user already liked, remove the like; otherwise add it.
- Comment ids on a Post are unique; attaching an existing id is a no-op.
- Likes and comments are part of the Post aggregate; there is no Friend or Like entity.

## Comments glossary

| Term | Meaning |
|------|---------|
| Comment | Aggregate root for a comment body and author display fields. Domain fields: `description`, `authorId`, `firstName`, `lastName`. Persistence maps `authorId` ↔ legacy `userId`. |
| Author | The user that wrote the Comment (`authorId` / legacy HTTP `userId`). |
| Link to Post | Association is **only** via `Post.comments[]` (comment ids). Comment items do **not** store `postId`. Feed owns attach (`attachCommentId` / `attachCommentToPostService`). |
| Create-on-post | Application orchestration: persist Comment, attach id on the Feed Post, return the hydrated Post (legacy create response). |

## Comments invariants (domain)

- Description is required (non-empty after trim) on create and description update.
- Author id is required (non-empty after trim) on create.
- Empty `firstName` / `lastName` are allowed (legacy validators: exists + isString).
- There is no `postId` on the Comment aggregate or COMMENT DynamoDB item.

## Identity glossary

| Term | Meaning |
|------|---------|
| User | Aggregate root for identity/profile. Owns email, display fields, optional password hash (local auth), optional `cognitoSub`, and embedded `friends[]` on the snapshot for profile/Feed hydration reads. Domain `id` ↔ persistence `_id`. Friendship **mutation** lives in Social graph (`FriendList`). |
| Cognito link | Persistence pointer item (`COGNITO#sub` / `LINK`) mapping Cognito access-token `sub` → application user id. Created/updated with USER when `cognitoSub` is set; looked up via `findByCognitoSub`. |
| Dual-mode auth | HS256 local/Jest register+login when Cognito env is unset; Cognito JWT + `POST /auth/profile` (complete profile / idempotent lookup) when Cognito env is set. HTTP contracts unchanged. |
| Identity facade | Public API of `server/modules/identity/` (composition services + domain/ports exports). Controllers and Feed assembler call the facade. |

## Identity invariants (domain)

- Email is required (non-empty after `trim().toLowerCase()`) on create.
- User id is required (non-empty after trim) on create.
- Password hashing is outside the domain (caller supplies opaque hash for local auth).
- `friends[]` may appear on User snapshots for reads; Identity does **not** own friendship toggle mutation (see Social graph).

## Social graph glossary

| Term | Meaning |
|------|---------|
| FriendList | Aggregate root for one user’s friendship membership. Domain fields: `userId`, `friends` (peer user ids), timestamps. Persist shape stays embedded `friends[]` on the USER PROFILE item (no `FRIEND#` edges). |
| Mutual toggle | Application use case `toggleFriendship`: load both peers’ FriendLists, toggle each side, save both. Aggregate `toggleFriend` mutates **this** list only. |
| Social facade | Public API of `server/modules/social/` (composition services + domain/ports exports). Friends HTTP paths call via `services/users.ts` re-exports (`getUserFriendsService` / `toggleRelationFriendService`). |
| Hydrated friends | `getUserFriendsService` resolves FriendList peer ids through Identity `getUserService` (legacy GET `/users/:id/friends` response shape). |

## Social graph invariants (domain)

- User id is required (non-empty after trim) on FriendList create.
- Self-friend is rejected (`Cannot friend yourself`).
- Empty friend id is rejected.
- `toggleFriend` mutates **this** aggregate’s `friends[]` only; bidirectional HTTP behavior is application orchestration (`toggleFriendship`).
- There is no Friend entity — friends remain `string[]` of peer user ids on USER.
- Social must not create USER profiles; saving a FriendList when the USER row is missing fails.

## Media glossary

| Term | Meaning |
|------|---------|
| MediaFile | Aggregate root for uploaded file metadata. Domain fields: `id`, optional `fileName` / `url`, soft-delete flag `deleted`. Domain `id` ↔ persistence `_id`. |
| Soft delete | Domain `softDelete` sets `deleted: true` and touches `updatedAt`; idempotent when already deleted. Active reads (`findById` / list / HTTP GET) hide soft-deleted rows. |
| Hard delete | Application orchestration: best-effort object-store delete, then remove the FILE Dynamo row. Not a domain method. |
| Object store | S3 (or memory no-op) blob storage. Outside the domain; adapters wrap `utilities/s3Upload` (`deleteMediaObject`, upload middleware sets `req.image.secure_url`). |
| Media facade | Public API of `server/modules/media/` (composition services + domain/ports exports). Controllers and Feed/Identity call via `services/storage.ts` re-exports. |
| Default image | Fixed id `DEFAULT_IMAGE_ID` (`63cf4d2242c5e33c105a87eb`); `createDefaultService` creates the row only when missing. |

## Media invariants (domain)

- Media file id is required (non-empty after trim) on create.
- Optional `fileName` / `url` are trimmed; blank after trim → `undefined`.
- Create always starts with `deleted: false`.
- Soft-delete is idempotent (already deleted → no-op, no throw).
- There is no hard-delete or S3 I/O on the aggregate.

## Persistence note

Feed persistence uses the existing DynamoDB single-table design (`POST#id` / `META`, GSI1 feed, GSI2 by user). Comments use `COMMENT#id` / `META`. Identity uses `USER#id` / `PROFILE` and optional `COGNITO#sub` / `LINK`. Social graph mutates `friends[]` on those USER items (no separate friendship rows). Media uses `FILE#id` / `META`. See `docs/data-model.md`, ADR `docs/adr/0001-feed-ddd-hexagonal.md`, ADR `docs/adr/0002-comments-ddd-hexagonal.md`, ADR `docs/adr/0003-identity-ddd-hexagonal.md`, ADR `docs/adr/0004-media-ddd-hexagonal.md`, and ADR `docs/adr/0005-social-graph-ddd-hexagonal.md`.
