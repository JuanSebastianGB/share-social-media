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

```bash
pnpm --filter server test
```

Seams under test: health, auth, users, posts, comments.

Known quirks documented by the suite:

- Many mutating routes (comments, like, delete post) do **not** require JWT today — that is characterized, not “fixed,” in this pass.
- Register requires multipart `myFile`; S3 upload is stubbed in tests (`MEDIA_ENDPOINT=memory`).
- `handleHttpErrors` often returns **403** for business failures.

## Conventions

- Server relative imports keep `.js` extensions (NodeNext ESM).
- Prefer changing behavior behind characterization tests (green suite first).
- Do not commit secrets (`.env`); use Secrets Manager in AWS (see [deployment.md](./deployment.md)).
