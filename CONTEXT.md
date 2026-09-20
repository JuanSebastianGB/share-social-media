# Domain Context — Share Social Media

This document records the ubiquitous language for the application. Bounded contexts are introduced incrementally (strangler).

## Bounded contexts

| Context | Status | Code |
|---------|--------|------|
| Feed | In progress (DDD hexagonal) | `server/modules/feed/` |
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
| Comment id | Identifier of a Comment record stored in `Post.comments[]`. The Comment record itself remains outside the Feed aggregate until a Comments BC exists. |

## Feed invariants (domain)

- A Post always has a non-empty body and an Author.
- Toggle like: if the user already liked, remove the like; otherwise add it.
- Comment ids on a Post are unique; attaching an existing id is a no-op.
- Likes and comments are part of the Post aggregate; there is no Friend or Like entity.

## Persistence note

Feed persistence uses the existing DynamoDB single-table design (`POST#id` / `META`, GSI1 feed, GSI2 by user). See `docs/data-model.md` and ADR `docs/adr/0001-feed-ddd-hexagonal.md`.
