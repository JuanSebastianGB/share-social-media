# Share Social Media

Full-stack social media demo: React client + Express API, modernized for TypeScript, characterization tests, GitHub Actions, and low-cost AWS serverless hosting.

## Architecture

```mermaid
flowchart LR
  User --> CF[CloudFront]
  CF --> S3[S3_static_client]
  User --> APIGW[HttpApi]
  APIGW --> Lambda[Express_Lambda]
  Lambda --> DDB[DynamoDB]
  Lambda --> MediaS3[S3_media]
  Lambda --> SM[Secrets_Manager]
```

| Layer | Tech |
|-------|------|
| Client | React 18, Vite, TypeScript, MUI, Redux |
| API | Express (TypeScript), JWT, AWS SDK |
| Media | S3 (`uploads/`) |
| Data | DynamoDB (on-demand, single-table) |
| Hosting | S3 + CloudFront (static SPA) |
| IaC | AWS CDK — HTTP API, Lambda, DynamoDB, S3 (site + media), CloudFront |
| CI/CD | GitHub Actions (OIDC deploy) |

## Features

- Auth (register / login)
- Profiles and friends
- Posts with likes, comments, infinite scroll
- File uploads via S3

## Quick start (local)

```bash
pnpm install
cp server/.env.example server/.env   # fill values
cp client/.env.example client/.env   # VITE_APP_BASE_URL=http://localhost:3000

pnpm --filter server dev
pnpm --filter client dev
```

### Environment

**Server** (`server/.env`):

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 3000) |
| `TABLE_NAME` | DynamoDB table (default `ShareSocialMedia`) |
| `DYNAMODB_ENDPOINT` | Optional local endpoint; use `memory` for in-process tests |
| `AWS_REGION` | AWS region for DynamoDB |
| `PUBLIC_URL` | Public base URL for stored files |
| `MEDIA_BUCKET` | S3 bucket for uploads |
| `MEDIA_BASE_URL` | Public URL prefix for media objects |
| `MEDIA_ENDPOINT` | Optional; `memory` stubs uploads locally |
| `JWT_SECRET` | JWT signing secret |

**Client** (`client/.env`):

| Variable | Description |
|----------|-------------|
| `VITE_APP_BASE_URL` | API base URL |
| `VITE_APP_DEFAULT_IMAGE_ID` | Default storage file id for avatars/posts |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm lint` | ESLint (client + server) |
| `pnpm typecheck` | TypeScript across packages |
| `pnpm test` | Server characterization tests |
| `pnpm build` | Build packages |
| `pnpm --filter server dev` | API with hot reload |
| `pnpm --filter client dev` | Vite dev server |

## Documentation

- [Development guide](docs/development.md) — tooling, tests, conventions
- [Deployment guide](docs/deployment.md) — CDK, secrets, CI/CD, cost notes
- [Infra README](infra/README.md) — CDK stacks overview

## Package layout

```
client/   React SPA
server/   Express API (server.ts local, handler.ts Lambda)
infra/    AWS CDK app
docs/     Development and deployment guides
```

## Backlog (not in this modernization pass)

- Tighten JWT on comments / likes / deletes (currently characterized as open)
- OAuth providers, websockets, bookmarks
- UI redesign

## Author

Sebastian Gonzalez — [GitHub](https://github.com/JuanSebastianGB)
