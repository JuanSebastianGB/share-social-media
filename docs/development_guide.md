# Development Guide

This guide provides step-by-step instructions for setting up the development environment and
running tests for Share Social Media.

Related docs (do not discard):

- [`docs/development.md`](./development.md) — concise monorepo/tooling notes
- [`docs/deployment.md`](./deployment.md) — AWS CDK / CI/CD
- [`README.md`](../README.md) — product overview

## Setup Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | **20+** (CI uses 20; `engines.node` `>=20`) |
| pnpm | **9.12.0** (see root `packageManager`) |
| Git | any recent |
| Docker | Optional — **required only** for `pnpm --filter server test:integration` (DynamoDB Local via Testcontainers). Not used for app runtime or default tests. |
| AWS CLI / CDK | Optional for local AWS deploys — see `deployment.md` |

Use the **root** `pnpm-lock.yaml` only. Nested `client/pnpm-lock.yaml` and `server/pnpm-lock.yaml` are legacy leftovers.

### 1. Clone the Repository

```bash
git clone git@github.com:JuanSebastianGB/share-social-media.git
cd share-social-media
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Configuration

#### Server

```bash
cp server/.env.example server/.env
```

Typical local `.env` (see `server/.env.example` for comments):

```env
PORT=3000
TABLE_NAME=ShareSocialMedia
DYNAMODB_ENDPOINT=memory
AWS_REGION=us-east-1
PUBLIC_URL=http://localhost:3000
JWT_SECRET=change-me-to-a-long-random-string
MEDIA_ENDPOINT=memory
MEDIA_BUCKET=share-social-media-media
MEDIA_BASE_URL=https://media.local
# Leave Cognito unset for local HS256 auth:
# COGNITO_USER_POOL_ID=
# COGNITO_CLIENT_ID=
```

| Variable | Purpose |
|----------|---------|
| `PORT` | API listen port (default 3000) |
| `TABLE_NAME` | DynamoDB table name |
| `DYNAMODB_ENDPOINT` | `memory` (in-process), DynamoDB Local URL, or empty for real AWS |
| `JWT_SECRET` | HS256 signing secret (local mode) |
| `MEDIA_ENDPOINT` | `memory` stubs S3 uploads |
| `MEDIA_BUCKET` / `MEDIA_BASE_URL` | S3 + public URL prefix |
| `COGNITO_USER_POOL_ID` + `COGNITO_CLIENT_ID` | When **both** set, Cognito access-token mode |

#### Client

```bash
cp client/.env.example client/.env
```

```env
VITE_APP_BASE_URL=http://localhost:3000
# Optional:
# VITE_APP_DEFAULT_IMAGE_ID=63cf4d2242c5e33c105a87eb
# VITE_COGNITO_USER_POOL_ID=
# VITE_COGNITO_CLIENT_ID=
# VITE_AWS_REGION=us-east-1
```

Local without Cognito: leave all `VITE_COGNITO_*` unset and matching server Cognito vars unset.

### 4. Datastore Setup

For day-to-day local work and tests:

```bash
# Already configured when DYNAMODB_ENDPOINT=memory — no external process
```

Optional alternatives:

- DynamoDB Local at `http://127.0.0.1:8000` (set `DYNAMODB_ENDPOINT` accordingly)
- Real AWS table (empty endpoint + credentials) — not required for characterization tests

Media: `MEDIA_ENDPOINT=memory` avoids S3. Real S3 needs credentials + bucket.

### 5. Backend Setup

```bash
pnpm --filter server dev
```

- Local entry: `server/server.ts`
- Confirm: `GET http://localhost:3000/` → `{ "a": 1 }`
- Swagger UI (stale): `http://localhost:3000/documentation`
- Contract of record: `docs/api-spec.yml`

Build:

```bash
pnpm --filter server build
pnpm --filter server start   # node dist/server.js
```

### 6. Frontend Setup

```bash
pnpm --filter client dev
```

Vite prints the local URL (typically `http://localhost:5173`). Ensure `VITE_APP_BASE_URL` points at the API.

### 7. Test Tooling Setup

Default suite (`pnpm --filter server test`): no browsers or containers. Jest uses the memory DynamoDB adapter and media stubs under `server/tests/`.

Integration suite (`pnpm --filter server test:integration`): requires **Docker**. Starts DynamoDB Local via Testcontainers; skips cleanly if Docker is unavailable.

## Testing

### Backend Testing

```bash
pnpm --filter server test
# Feed + Comments + Identity domain unit/property + characterization (memory DynamoDB)

pnpm --filter server test:integration
# HTTP + real DynamoDB Local (Docker required)
```

Characterization suites live in `server/tests/`:

- `health.test.ts`
- `auth.characterization.test.ts`
- `cognito-mode.characterization.test.ts`
- `users.characterization.test.ts`
- `posts.characterization.test.ts`
- `comments.characterization.test.ts`

Feed DDD tests live under `server/modules/feed/` (`*.test.ts`) and `server/tests/posts.integration.spec.ts`.

Comments DDD tests live under `server/modules/comments/` (`*.test.ts`) and `server/tests/comments.integration.spec.ts`.

Identity DDD tests live under `server/modules/identity/` (`*.test.ts`) and `server/tests/identity.integration.spec.ts`.

Media DDD tests live under `server/modules/media/` (`*.test.ts`) and `server/tests/media.integration.spec.ts`.

Social DDD tests live under `server/modules/social/` (`*.test.ts`) and `server/tests/social.integration.spec.ts`.

Catalog DDD tests live under `server/modules/catalog/` (`*.test.ts`) and `server/tests/catalog.integration.spec.ts`.

There is **no coverage threshold** and no watch script documented in `package.json`. Prefer extending characterization tests when changing HTTP behavior; prefer domain unit/property tests when changing Feed, Comments, Identity, Media, Social, or Catalog invariants.

### Client Testing

```bash
pnpm --filter client test
# Vitest + jsdom + Testing Library — colocated *.characterization.spec.ts,
# *.component.spec.tsx, *.property.spec.ts under client/src

pnpm --filter client test:watch
# Interactive Vitest watch mode
```

Strategy: global **qa-expert** decision tree — characterization for legacy client seams, component specs for UI, property-based for schema invariants, e2e deferred. See `docs/frontend-standards.md` and `client/tests/docs/TEST-STRATEGY.md`.

## Root quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI also runs `cdk synth` in `infra/` (see `.github/workflows/ci.yml`).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Client calls fail / CORS or network | Wrong `VITE_APP_BASE_URL` or API down | Start server; match port in client env |
| `ERROR_USE_COGNITO_AUTH` (410) on register/login | Cognito env set on server | Unset Cognito for local HS256, or use Cognito SPA flow + `/auth/profile` |
| `ERROR_USE_REGISTER` (410) on profile | Cognito **not** enabled on server | Set both Cognito env vars, or use register/login |
| Register fails upload | Missing multipart `myFile` | Client FormData must include file field `myFile` |
| Jest Dynamo errors | Endpoint not memory in tests | Use test setup; do not point tests at prod |
| Lockfile / peer noise from nested locks | Legacy nested `pnpm-lock.yaml` | Install only from repo root |
| ESLint ignores infra | By design in `eslint.config.js` | Do not expect `infra/**` lint in CI |
| Prettier unused | No format script | Format manually if desired; not a CI gate |
| Media 403 in browser after deploy | Old S3 URLs in Dynamo | Rewrite to CloudFront base (`deployment.md`) |

## Dual-mode auth quick matrix

| Client env | Server env | Use |
|------------|------------|-----|
| Cognito unset | Cognito unset | `/auth/register` + `/auth/login` (HS256) |
| Cognito set (all three Vite vars) | Cognito set (pool + client) | Cognito SignUp/SignIn + `POST /auth/profile` |
| Mismatch | Mismatch | Broken flows / 410 — keep modes aligned |
