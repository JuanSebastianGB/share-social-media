---
description: Backend development standards, best practices, and conventions for the Share Social Media Express + DynamoDB + AWS Lambda application, including architecture patterns, API design, data access, testing, and security practices
globs: server/**/*.{ts,js},infra/**/*.{ts,js}
alwaysApply: true
---

# Backend Project Standards and Best Practices

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Design Principles](#design-principles)
- [Domain Modeling](#domain-modeling)
- [Coding Standards](#coding-standards)
- [API Design Standards](#api-design-standards)
- [Data Layer Patterns](#data-layer-patterns)
- [Testing Standards](#testing-standards)
- [Performance Best Practices](#performance-best-practices)
- [Security Best Practices](#security-best-practices)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Legacy and Known Debt](#legacy-and-known-debt)

## Overview

The Share Social Media backend is an Express 4 API written in TypeScript (NodeNext ESM). It runs locally via `server/server.ts` and in AWS as a Lambda (Node 20) behind API Gateway HTTP API via `server/handler.ts` and `@codegenie/serverless-express`. Persistence is a DynamoDB single-table design (`ShareSocialMedia`). Media uploads go to S3 and are served through CloudFront. Authentication is **dual-mode**: local HS256 JWTs when Cognito env vars are unset, and Cognito access-token verification when both `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID` are set.

Architecture is **layered but uneven**. New code must follow **route → middleware → controller → service → repository → DynamoDB**. Several older domains skip the service layer (see [Legacy and Known Debt](#legacy-and-known-debt)).

Contract of record for HTTP: [`docs/api-spec.yml`](./api-spec.yml). The in-server Swagger at `/documentation` (`server/docs/swagger.js`) is **stale** — do not treat it as authoritative when it disagrees with handlers or `api-spec.yml`.

## Technology Stack

### Core Technologies

| Concern | Choice | Notes |
|---------|--------|-------|
| Language | TypeScript 5.x | Server `tsc` build; `"type": "module"` |
| Runtime | Node.js >= 20 | Lambda runtime Node 20; CI Node 20 |
| HTTP framework | Express 4.22.x | Mounted in `server/app.ts` |
| Local runner | `tsx watch` | `pnpm --filter server dev` |
| Lambda adapter | `@codegenie/serverless-express` | `server/handler.ts` |
| Auth verify | `aws-jwt-verify` + `jsonwebtoken` | Cognito vs HS256 |
| Uploads | `multer` (memory) + S3 SDK | Dominant path; disk `storage/` is legacy |
| Validation | `express-validator` | Failures return **403** `{ errors: [...] }` |
| Logging | `morgan('dev')` | No structured logger yet |
| CORS | `cors()` default | Open in local/demo |

### Database & Data Access

| Concern | Choice | Notes |
|---------|--------|-------|
| Engine | DynamoDB | Table name from `TABLE_NAME` (default `ShareSocialMedia`) |
| Client | `@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb` | Document client via `server/db/client.ts` |
| Local/test | `DYNAMODB_ENDPOINT=memory` | In-process adapter (`server/db/memoryClient.ts`) |
| Keys / GSI helpers | `server/db/keys.ts` | PK/SK + GSI1 + GSI2 |
| Entity types | `server/types/entities.ts` | `UserRecord`, `PostRecord`, `CommentRecord`, `StorageRecord`, `ItemRecord` |
| ORM | **None** | Hand-written repositories |
| Migrations | **None** | Schema is CDK table + item shape conventions |

### Testing Framework

| Concern | Choice | Notes |
|---------|--------|-------|
| Runner | Jest 29 + `ts-jest` | `NODE_OPTIONS=--experimental-vm-modules` |
| HTTP | `supertest` | Against Express app (`server/tests/testApp.ts`) |
| Style | Characterization + Feed/Comments domain unit/property + optional integration | Lock HTTP; drive DDD with unit/property; DynamoDB Local for integration |
| Coverage threshold | **None** | No gate in CI beyond green suite |
| Location | `server/tests/*.characterization.test.ts`, `server/modules/feed/**/*.test.ts`, `server/modules/comments/**/*.test.ts`, `*.integration.spec.ts` | |
| Integration | `pnpm --filter server test:integration` | Testcontainers DynamoDB Local; Docker required; skips if unavailable |

### Development Tools

| Concern | Choice | Notes |
|---------|--------|-------|
| Package manager | pnpm 9.12.0 workspace | Root lockfile only |
| Lint | ESLint flat (`eslint.config.js`) | Server stricter; `infra/**` ignored |
| Format | Prettier (`.prettierrc`) | **No** format script / CI step |
| Typecheck | `tsc --noEmit` | Package script `typecheck` |
| IaC | aws-cdk-lib 2.270 + CDK CLI 2.1142 | `infra/` package |

## Architecture Overview

### Architectural Style

**Layered Express API** with DynamoDB repositories and optional service orchestration.

```
HTTP request
  → routes/*.ts          (path + middleware chain)
  → middlewares/*        (JWT, role, cache, validators)
  → controllers/*        (HTTP I/O, matchedData, status codes)
  → services/* OR modules/feed OR modules/comments OR modules/identity  (orchestration; DDD hexagonal BCs)
  → repositories/* / Dynamo adapters
  → DynamoDB / S3
```

**Feed BC (done / migrated):** `server/modules/feed/` — domain `Post` aggregate, application use cases, `PostRepository` port, DynamoDB adapter. Controllers call the Feed facade; `server/services/posts.ts` re-exports it for compatibility.

**Comments BC (done / migrated):** `server/modules/comments/` — domain `Comment` aggregate, application use cases, `CommentRepository` port, DynamoDB + in-memory adapters. Controllers call the Comments facade (`modules/comments`); create-on-post orchestrates Feed attach and returns a hydrated Post. Legacy `server/repositories/comments.ts` remains as an unused strangler remnant (do not call it).

**Identity BC (in progress):** `server/modules/identity/` — hexagonal DDD scaffolding; `User` aggregate includes profile fields, dual-mode auth persistence concerns, and embedded `friends[]` for this slice (approach B). Controllers will call the Identity facade (not deepen legacy service/repo skips).

**Dual entrypoints:**

- Local: `server/server.ts` listens on `PORT` (default 3000).
- AWS: `server/handler.ts` exports the Lambda handler wrapping the same `app`.

### Layer Responsibilities

| Layer | Belongs here | Forbidden |
|-------|--------------|-----------|
| **Routes** | Path mounting, middleware order, OpenAPI comments (legacy) | Business rules, DynamoDB calls |
| **Middleware** | Auth (`checkValidJwt` / `checkAuthToken`), role checks, cache, multer/S3 upload hooks | Domain writes |
| **Controllers** | Parse `matchedData` / params / query; call services; map to HTTP via `res.json` / `handleHttpErrors` | Raw DocumentClient usage (new code) |
| **Services** | Multi-repo orchestration, hydration (e.g. post + file + user), auth flows | Express `req`/`res` objects |
| **Repositories** | Single-table item CRUD/query; key construction via `db/keys.ts` | HTTP status decisions |
| **Utilities** | JWT, password hash, Cognito mode flag, S3 upload helpers, validators glue | Scattered business rules that belong in services |

### Project Structure

```
server/
  app.ts                 Express app: cors, json, static storage, route mounts
  server.ts              Local HTTP listen
  handler.ts             Lambda entry (@codegenie/serverless-express)
  routes/                Express routers (auth, users, posts, comments, items, storage)
  middlewares/           session (JWT/Cognito), role, cache
  controllers/           Request handlers
  services/              auth, users, posts, storage (items: LEGACY — none; comments: modules/comments; identity migrating)
  modules/feed/          Feed BC (hexagonal DDD)
  modules/comments/      Comments BC (hexagonal DDD)
  modules/identity/      Identity BC (hexagonal DDD; in progress)
  repositories/          DynamoDB access (users, posts, storage, items; comments.ts unused remnant)
  validators/            express-validator chains
  db/                    client, memoryClient, keys, ids
  database/              Optional local Dynamo table bootstrap helpers
  types/entities.ts      Record types returned by repositories
  utilities/             handleHttpErrors, handleJwt, handlePassword, s3Upload, cognitoMode, …
  docs/swagger.js        LEGACY stale Swagger setup served at /documentation
  tests/                 Jest characterization suite
  storage/               LEGACY on-disk static files (express.static('storage'))
  constants/             DEFAULT_IMAGE_ID / MONGO_IMAGE_ID alias
```

## Design Principles

### Prefer controller → service → repository (new code)

**Compliant:** `controllers/posts.ts` → Feed facade (`modules/feed` / `services/posts.ts` re-export) → Dynamo adapter.

**Compliant:** `controllers/comments.ts` (and posts comment list paths) → Comments module facade (`modules/comments`) → Dynamo adapter. Do not call `repositories/comments.ts` (unused strangler remnant).

**Identity (in progress):** prefer `controllers/auth.ts` / `controllers/users.ts` → Identity module facade (`modules/identity`) rather than deepening controller → service → `repositories/users.ts`. Dual-mode auth stays explicit; friends remain embedded on User for this slice.

**Violating (legacy, do not copy):** `controllers/items.ts` calls repositories directly.

### Keep DynamoDB keys centralized

**Compliant:** use `userPk`, `postPk`, `emailGsi1Pk`, `cognitoPk`, `postSortKey`, `SK`, `GSI` from `server/db/keys.ts`.

**Violating:** hard-coding `USER#${id}` string prefixes in a controller or a one-off script.

### Dual-mode auth must stay explicit

**Compliant:** branch on `isCognitoAuthEnabled()` at auth boundaries; local register/login return **410** when Cognito is on; `/auth/profile` returns **410** when Cognito is off.

**Violating:** mixing password hashes into Cognito profile creation, or verifying HS256 tokens when Cognito env is set.

### Errors are transport-shaped, not exception-typed

There is **no global Express error middleware**. Controllers catch and call `handleHttpErrors(res, message, code?)`, which defaults to **403** and a **JSON string body** (not `{ message }`).

**Compliant:** `return handleHttpErrors(res, 'ERROR_USER_NOT_FOUND');`

**Violating:** throwing uncaught errors expecting a framework handler, or inventing a new error envelope without updating characterization tests and `api-spec.yml`.

### SOLID (applied pragmatically)

- **SRP:** repositories own persistence; services own use-cases; controllers own HTTP.
- **OCP:** add new routes/services rather than bloating `app.ts` with inline handlers (except the tiny health/checktoken mounts already there).
- **DIP:** controllers depend on services/repositories modules, not on DocumentClient construction.
- **DRY:** hydrate posts in one place (`hydratePost` in posts service); do not re-implement feed hydration in controllers.

## Domain Modeling

**Legacy default:** most domains are still TypeScript record types plus DynamoDB item shapes (layered CRUD).

**Feed (done / migrated):** the Posts/Feed bounded context lives under `server/modules/feed/`. See [CONTEXT.md](../CONTEXT.md) and [ADR 0001](./adr/0001-feed-ddd-hexagonal.md). New Posts domain logic belongs in the Feed module, not in ad-hoc service functions.

**Comments (done / migrated):** the Comments bounded context lives under `server/modules/comments/`. See [CONTEXT.md](../CONTEXT.md) and [ADR 0002](./adr/0002-comments-ddd-hexagonal.md). Create-on-post orchestrates Feed attach and returns a hydrated Post; Comment items have no `postId`. New comment domain logic belongs in the Comments module, not in controllers or `repositories/comments.ts`.

**Identity (in progress):** the Identity bounded context is migrating to hexagonal DDD under `server/modules/identity/`. See [CONTEXT.md](../CONTEXT.md) and [ADR 0003](./adr/0003-identity-ddd-hexagonal.md). Dual-mode auth stays explicit; friends remain embedded on the User aggregate for this slice (approach B — Social graph extract later).

### Entities (implemented)

| Entity | `entityType` | PK / SK | Notes |
|--------|--------------|---------|-------|
| USER | `USER` | `USER#id` / `PROFILE` | Friends embedded as `friends: string[]` |
| COGNITO_LINK | `COGNITO_LINK` | `COGNITO#sub` / `LINK` | Maps Cognito `sub` → app user id |
| POST | `POST` | `POST#id` / `META` | Likes embedded as `likes: Record<userId, true>` |
| COMMENT | `COMMENT` | `COMMENT#id` / `META` | Linked from `Post.comments[]` ids; **no postId on item** |
| FILE (storage) | `FILE` | `FILE#id` / `META` | Soft-delete via `deleted` |
| ITEM | `ITEM` | `ITEM#id` / `META` | Demo CRUD resource |

There are **no** Friend or Like entities — those are embedded attributes.

### Identifiers

- IDs are **24-character hex** strings from `generateId()` (`server/db/ids.ts`), compatible with express-validator `isMongoId()`.
- This is a **Mongo-era legacy convention**, not MongoDB usage. Do not introduce real ObjectId libraries.

### Timestamps

- ISO-8601 strings: `createdAt`, `updatedAt`.
- No separate audit table.

## Coding Standards

### Naming Conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Files (routes/controllers) | kebab or plural noun matching resource | `routes/posts.ts`, `controllers/auth.ts` |
| Exported handlers | camelCase verbs | `getPostsPagination`, `toggleLikePost` |
| Services | `*Service` suffix on functions | `createPostService` |
| Repositories | verb + entity | `getUserByEmail`, `listFeedPostIds` |
| Env vars | SCREAMING_SNAKE | `TABLE_NAME`, `COGNITO_USER_POOL_ID` |
| Dynamo keys | helpers in `keys.ts` | `userPk(id)` → `USER#…` |
| Error message codes | `ERROR_*` strings | `ERROR_LOGIN`, `ERROR_USE_COGNITO_AUTH` |

### Type Usage

- Prefer types from `server/types/entities.ts` at repository boundaries.
- Relative imports **must** use `.js` extensions (NodeNext).
- `any` is discouraged but ESLint `@typescript-eslint/no-explicit-any` is **off** for server — do not expand its use without cause.
- Unused args/vars: prefix with `_` (eslint warn pattern).

### Error Handling

```typescript
// Default business/unknown failure — JSON string body, status 403
handleHttpErrors(res, 'ERROR_REGISTER');

// Explicit status when needed
handleHttpErrors(res, 'ERROR_USE_COGNITO_AUTH', 410);
handleHttpErrors(res, 'ERROR_NOT_VALID_SESSION_CREDENTIALS', 401);
```

Validation failures (express-validator via `validateResults`):

```json
{ "errors": [ /* express-validator error objects */ ] }
```

Status **403** (not 422), despite some stale OpenAPI comments saying 422.

### Validation Patterns

- Define chains in `server/validators/<resource>.ts`.
- End chains with `validateResults` from `utilities/handleValidator.ts`.
- Controllers read sanitized fields with `matchedData(req)`.
- Path ids typically use `.isMongoId()` — keep generating 24-hex ids.

### Logging Standards

- Request logging: `morgan('dev')` only.
- Ad-hoc `console.log` exists in catch blocks (legacy). Prefer not adding more noisy logs; never log passwords, JWT secrets, or full access tokens.
- **Planned / not present:** structured logger, request correlation ids.

## API Design Standards

### Endpoint Conventions

Mounted in `server/app.ts`:

| Mount | Auth gate at mount | Resource |
|-------|--------------------|----------|
| `GET /` | none | Health-ish `{ a: 1 }` |
| `/checktoken` | `checkValidJwt` | Returns plain `ok` |
| `/documentation` | none | Swagger UI (stale) |
| `/auth` | per-route | register, login, profile |
| `/users` | per-route | list/get/friends/posts/toggle friend |
| `/posts` | per-route | feed, CRUD-ish, likes, comments list |
| `/comments` | per-route | comment CRUD |
| `/items` | per-route | item CRUD (+ cache on list) |
| `/storage` | **JWT on entire mount** | file metadata CRUD |
| `/defaulstorage` | none | **Legacy typo path** — ensures default image row |

No URL versioning (`/v1`). No HATEOAS.

### Request/Response Patterns

- Success bodies are usually **raw JSON** of the resource or array — **no** standard `{ data }` envelope.
- Exceptions:
  - Login: `{ userFound, token }`
  - Cognito profile: `{ response: user }`
  - Some auth register responses follow service return shape
- Posts list pagination: query `page` (default 1), `search` (optional); **hard-coded limit = 2** in controller.
- Multipart field name for uploads: **`myFile`**.
- Hydrated posts include nested `user` and `file` objects for feed/UI.

### Error Response Format

| Source | Status | Body |
|--------|--------|------|
| `handleHttpErrors` | default 403 (or passed code) | JSON **string** message, e.g. `"ERROR_LOGIN"` |
| `validateResults` | 403 | `{ "errors": [...] }` |
| Cognito/local mode mismatch | 410 | `"ERROR_USE_COGNITO_AUTH"` or `"ERROR_USE_REGISTER"` |

### Cross-Origin and Headers

- `cors()` with defaults (permissive for demo).
- Auth: `Authorization: Bearer <token>`.
- Content-Type: `application/json` or `multipart/form-data` for uploads.

## Data Layer Patterns

### Schema Definition

- Physical table defined in CDK (`infra/lib/api-stack.ts`): PK, SK, GSI1 (`GSI1PK`/`GSI1SK`), GSI2 (`GSI2PK`/`GSI2SK`), on-demand billing.
- Logical schema = item attributes written by repositories + types in `entities.ts`.
- Document access patterns in [`docs/data-model.md`](./data-model.md).

### Migrations

- **No migration framework.** Schema evolution is:
  1. Update repository write/read mapping.
  2. Update CDK only if new indexes/attributes-as-keys are required.
  3. Backfill or tolerate old items (e.g. media URL host migration noted in `docs/deployment.md`).

### Data Access Pattern

- **Repository pattern** with DocumentClient commands.
- Prefer **Get/Query** over **Scan**. Scans exist for users/comments/items/storage lists — treat as **legacy / demo-scale only**; do not add new Scan-based list APIs without an index plan.
- Feed: Query GSI1 with `GSI1PK = FEED`.
- User posts: Query GSI2 with `GSI2PK = USER#userId`.
- Email lookup: Query GSI1 with `EMAIL#email` / `USER`.
- Cognito link: GetItem on `COGNITO#sub` / `LINK`.

## Testing Standards

### Test File Structure

```
server/tests/
  health.test.ts
  auth.characterization.test.ts
  cognito-mode.characterization.test.ts
  users.characterization.test.ts
  posts.characterization.test.ts
  comments.characterization.test.ts
  posts.integration.spec.ts
  comments.integration.spec.ts
  integration/               # DynamoDB Local Testcontainers harness
  helpers.ts
  setup.ts
  setup-env.cjs
  testApp.ts
server/modules/feed/
  domain/*.test.ts
  domain/*.property.test.ts
  application/**/*.test.ts
  infrastructure/*.test.ts
server/modules/comments/
  domain/*.test.ts
  domain/*.property.test.ts
  application/**/*.test.ts
  infrastructure/*.test.ts
```

### Test Organization

- One characterization file per HTTP area.
- Shared app bootstrap and env stubs in `testApp.ts` / `setup*.ts`.
- Suites run with DynamoDB memory + media memory stubs.

### Test Naming Convention

- Prefer descriptive `it('…')` sentences that state observed behavior (including quirks).
- Compliant: `it('returns 403 string body when login password mismatches')`.
- Non-compliant: `it('works')`.

### Test Structure

Arrange → Act → Assert with Supertest:

```typescript
const res = await request(app).post('/auth/login').send({ email, password });
expect(res.status).toBe(403);
expect(res.body).toBe('ERROR_PASSWORD');
```

### Mocking Standards

- Prefer **in-memory DynamoDB** and `MEDIA_ENDPOINT=memory` over mocking repositories.
- Do not mock Express itself; hit real routers.
- Cognito mode tests set/unset env and assert 410 / profile behavior.

### Coverage Requirements

- **No numeric coverage threshold.**
- Gate: suite must stay green in CI (`pnpm --filter server test`).
- When changing behavior, update or add characterization cases in the same PR.

### Test Data Management

- Generate ids via real `generateId` or known fixtures.
- Isolation: memory client reset between tests (see `setup.ts` / helpers).
- Register flows need multipart `myFile`; tests stub media.

### Integration Testing

- Characterization tests **are** the HTTP integration layer.
- No separate Testcontainers / localstack requirement for CI.
- AWS deploy verification is manual / CD (`docs/deployment.md`).

### Anti-Patterns to Avoid

| Anti-pattern | Do instead |
|--------------|------------|
| “Fixing” open JWT on a route without updating tests | Change auth + characterization together |
| Asserting against stale Swagger | Assert against handlers / `api-spec.yml` |
| Skipping service layer in new features | Add `services/<domain>.ts` |
| Adding Scan for a hot path | Add GSI + Query |
| Inventing REST error objects | Match `handleHttpErrors` / validator shapes |

## Performance Best Practices

### Query Optimization

- Use GSI1 feed and GSI2 per-user post indexes.
- Hydration (`hydratePost`) does sequential Gets — acceptable at demo scale; avoid calling it in nested loops for unbounded lists without pagination awareness.
- Pagination page size is currently **2** — changing it is a product/API change; update client infinite scroll assumptions.

### Concurrency Patterns

- Async/await throughout; no explicit worker queues.
- Lambda: single Express app instance per warm container via serverless-express.

### Caching

- `express-expeditious` cache middleware used on `GET /items` only.
- No Redis. Do not introduce a cache tier casually.

## Security Best Practices

### Input Validation and Sanitization

- Validate at the route with express-validator before controllers mutate state.
- Never trust client-supplied `userId` for ownership when JWT provides `req.userData._id` (comments already set userId from JWT on create).

### Authentication and Authorization

| Mode | When | Behavior |
|------|------|----------|
| Local HS256 | Cognito env **unset** | `/auth/register`, `/auth/login` issue `JWT_SECRET` tokens |
| Cognito | Both pool id + client id **set** | Register/login **410**; SPA uses Cognito SDK; `/auth/profile` completes Dynamo user |

- Middleware: `checkValidJwt` (required user), `checkAuthToken` (profile flow).
- Role middleware `role(['admin'])` on `POST /items`.
- **Known gap (characterized):** some mutating comment/like/delete paths historically lacked JWT — verify current route file before changing; keep tests in sync.

### Secrets and Environment Variables

Documented in `server/.env.example` and `docs/deployment.md`. Never commit `.env`. In AWS, `JWT_SECRET` / `PUBLIC_URL` live in Secrets Manager; Cognito ids and table/media env are Lambda environment variables from CDK.

### Dependency Management

- Add dependencies via `pnpm --filter server add …` so the **root** lockfile updates.
- Do not revive nested package lockfiles.

## Development Workflow

### Git Workflow

- Branches: `feat/<topic>` or `feat/<topic>-NN-slice`.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`, …).
- PRs: CI must pass (lint, typecheck, server test, builds, cdk synth).

### Development Scripts

```bash
pnpm install
pnpm --filter server dev          # tsx watch on server.ts
pnpm --filter server test         # Jest characterization
pnpm --filter server lint
pnpm --filter server typecheck
pnpm --filter server build        # tsc → dist/
```

### Code Quality Gates

| Gate | Tool | Blocks merge? |
|------|------|---------------|
| Lint | ESLint (server) | Yes (CI) |
| Types | `tsc --noEmit` | Yes |
| Tests | Jest | Yes |
| Format | Prettier | **No** (not in CI) |
| Husky | — | **None** |

## Deployment

Authoritative guide: [`docs/deployment.md`](./deployment.md).

Summary:

- CDK stacks: API (HTTP API + Lambda + DynamoDB + Cognito + media) and Web (S3 + CloudFront SPA).
- CD: GitHub Actions OIDC on `main`.
- Lambda Node 20 `NodejsFunction`.

Do not duplicate full deploy runbooks here; keep this section as a pointer plus backend-specific constraints (env vars the Lambda must see, dual auth mode in prod Cognito).

## Legacy and Known Debt

Documented so agents do not “clean up” blindly without tests and product intent:

| Debt | Reality | Guidance for new work |
|------|---------|------------------------|
| comments repo unused remnant | `repositories/comments.ts` unused after Comments BC wire; controllers → `modules/comments` facade; create attaches via Feed | Do not revive the remnant; new comment logic in `server/modules/comments/` (ADR 0002) |
| items skip services | Controllers → repositories | Introduce a service or BC when touching Items |
| Posts service is Feed facade | `server/services/posts.ts` re-exports `modules/feed` | New Posts domain logic goes in `server/modules/feed/` |
| Scan-based lists | users, comments (Comments `list()`), items, storage | Prefer Query + GSI |
| `express.static('storage')` | On-disk legacy | Prefer S3 + CloudFront media |
| `/defaulstorage` typo | Real mounted path | Keep path for client compat; do not “fix” spelling without client change |
| Mongo-style hex ids | `isMongoId()` validators | Keep generating 24-hex ids |
| `handleHttpErrors` → 403 string | Characterized | Preserve unless intentionally migrating API |
| Stale `/documentation` Swagger | Served but outdated | Update `docs/api-spec.yml` first |
| Nested `pnpm-lock.yaml` under client/server | Legacy | Ignore; use root lock |
| No global error middleware | Controllers catch locally | Do not assume uncaught errors become JSON |
