# Development guide

## Monorepo layout

| Package | Path | Role |
|---------|------|------|
| `client` | [`client/`](../client/) | React + Vite + TypeScript SPA |
| `server` | [`server/`](../server/) | Express API (TypeScript), local + Lambda entrypoints |
| `infra` | [`infra/`](../infra/) | AWS CDK (HTTP API, Lambda, DynamoDB, S3 media + site, CloudFront) |

Root scripts (run from repo root with pnpm):

```bash
pnpm lint
pnpm typecheck
pnpm test          # runs package test scripts (server Jest suite)
pnpm build         # builds packages that define build
```

## Prerequisites

- Node.js 20+
- pnpm 9 (`packageManager` field in root `package.json`)
- DynamoDB: set `DYNAMODB_ENDPOINT=memory` for local/dev without AWS, or point at a real table / DynamoDB Local
- Media: set `MEDIA_ENDPOINT=memory` to stub S3 uploads locally

## Local setup

```bash
pnpm install
cp server/.env.example server/.env
# fill TABLE_NAME / DYNAMODB_ENDPOINT / MEDIA_*, JWT_SECRET, PUBLIC_URL
cp client/.env.example client/.env
# set VITE_APP_BASE_URL to http://localhost:3000 (or your API port)
```

### API

```bash
pnpm --filter server dev
```

- Local entry: [`server/server.ts`](../server/server.ts) (HTTP listen)
- Lambda entry: [`server/handler.ts`](../server/handler.ts) (`@codegenie/serverless-express`)

### Client

```bash
pnpm --filter client dev
```

## Tooling

- **TypeScript**: server uses `NodeNext` ESM (`outDir: dist`); client uses Vite.
- **ESLint**: flat config at repo root [`eslint.config.js`](../eslint.config.js). Server is stricter; client legacy rules are relaxed so CI stays green without a UI rewrite.
- **Prettier**: [`.prettierrc`](../.prettierrc)

## Tests

Characterization tests live under [`server/tests/`](../server/tests/). They lock current HTTP behavior (status codes, auth gaps, response shapes) using Jest + Supertest + an in-memory DynamoDB DocumentClient (`DYNAMODB_ENDPOINT=memory`).

Feed DDD unit/property tests live under [`server/modules/feed/`](../server/modules/feed/). Comments DDD unit/property tests live under [`server/modules/comments/`](../server/modules/comments/). Identity DDD unit/property tests live under [`server/modules/identity/`](../server/modules/identity/). Media DDD unit/property tests live under [`server/modules/media/`](../server/modules/media/). Integration tests (`test:integration`) use DynamoDB Local via Testcontainers (`posts.integration.spec.ts`, `comments.integration.spec.ts`, `identity.integration.spec.ts`, `media.integration.spec.ts`) and require Docker.

```bash
pnpm --filter server test
pnpm --filter server test:integration   # Docker required
```

Seams under test: health, auth, users, posts, comments, Feed domain, Comments domain, Identity domain.

Known quirks documented by the suite:

- JWT is required on comment, like, and post-delete mutations. Ownership is required for comment update/delete, post delete, and storage soft-delete (403 `ERROR_NOT_RESOURCE_OWNER`). Likes are any signed-in user. Public GETs stay public.
- Register requires multipart `myFile`; S3 upload is stubbed in tests (`MEDIA_ENDPOINT=memory`).
- `handleHttpErrors` often returns **403** for business failures.

## Conventions

- Server relative imports keep `.js` extensions (NodeNext ESM).
- Prefer changing behavior behind characterization tests (green suite first).
- Do not commit secrets (`.env`). `JWT_SECRET` and `PUBLIC_URL` are local-only for HS256 when Cognito env is unset; the API stack does not store them in Secrets Manager (see [deployment.md](./deployment.md)).
