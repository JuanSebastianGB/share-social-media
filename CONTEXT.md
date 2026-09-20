# Domain Context — Share Social Media

This document records the ubiquitous language for the application. Bounded contexts are introduced incrementally (strangler).

## Bounded contexts

| Context | Status | Code |
|---------|--------|------|
| Feed | Done (DDD hexagonal) | `server/modules/feed/` |
| Comments | In progress (DDD hexagonal) | `server/modules/comments/` |
| Identity | Legacy layered | `server/controllers/auth.ts`, `server/services/auth.ts` |
| Social graph | Legacy layered | friends on User |
| Media | Legacy utilities | `server/services/storage.ts`, S3 upload |
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

## Comments glossary (stub)

| Term | Meaning |
|------|---------|
| Comment | Aggregate root for a comment body and author display fields. Fields: `description`, `authorId`/`userId`, `firstName`, `lastName`. |
| Author | The user that wrote the Comment (`userId` / planned `authorId`). |
| Link to Post | Association is **only** via `Post.comments[]` (comment ids). Comment items do **not** store `postId`. |

## Persistence note

Feed persistence uses the existing DynamoDB single-table design (`POST#id` / `META`, GSI1 feed, GSI2 by user). Comments use `COMMENT#id` / `META`. See `docs/data-model.md`, ADR `docs/adr/0001-feed-ddd-hexagonal.md`, and ADR `docs/adr/0002-comments-ddd-hexagonal.md`.
