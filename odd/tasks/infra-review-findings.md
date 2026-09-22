# Infra review findings

## Objective

Remove dead infrastructure from the CDK app and publish the SPA outside the web stack.

## Problem

The deployed API always sets Cognito env, so `JWT_SECRET` is unused and `PUBLIC_URL` is unread. The HTTP API registers two catch-all routes. `BucketDeployment` forces a placeholder `client/dist` at synth time. The OIDC template claims the provider is created only when missing, and `DescribeStacks` is account-wide.

## Why

Thermo-nuclear review of `infra` (2026-09-21). Behavior of the running app stays the same: Cognito auth, private media via CloudFront, static site on S3 + CloudFront.

## Scope

- In: `infra/lib/api-stack.ts`, `infra/lib/web-stack.ts`, `infra/bin/app.ts`, `infra/github-oidc.yaml`, `infra/tests`, `infra/package.json`, `infra/tsconfig.json`, `infra/README.md`, `.github/workflows/cd.yml`, `.github/workflows/ci.yml`, `docs/deployment.md`, `docs/backend-standards.md`, `docs/development.md`
- Out: local `.env` / `JWT_SECRET` for HS256 when Cognito is unset; server auth code; Cognito resources; media bucket; table name; `RemovalPolicy.DESTROY`; CORS `*`

## Constraints

- English artifacts. No commit unless the user asks.
- Do not split stacks into per-resource constructs.
- Deployed Lambda env: `TABLE_NAME`, `MEDIA_BUCKET`, `MEDIA_BASE_URL`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`. No `JWT_SECRET`, no `PUBLIC_URL`.
- One HTTP API route: `$default` via `defaultIntegration`.
- Web stack owns the private bucket and distribution only. CD syncs `client/dist` and invalidates CloudFront.
- OIDC provider stays create-once (document that; do not add a conditional). Scope `DescribeStacks` to `ShareSocialMediaApi` and `ShareSocialMediaWeb`. Drop `ListStacks`. Add account-scoped S3 sync and CloudFront invalidation so CD can publish the site. Call out that `ShareSocialMediaGithubOidc` must be redeployed once before the new sync works.
- Removing the secret from the template orphans it (CDK default RETAIN). Document manual deletion of that leftover secret.

## Tasks

- [x] **T1** API stack: assertion test, then delete the secret, the extra route, and `apiUrl`. Route: delegated.
- [x] **T2** Web stack: assertion test, then drop `BucketDeployment` and add `DistributionId`. Route: delegated.
- [x] **T3** CD publish step, OIDC policy, docs, CI runs `pnpm --filter infra test`. Route: delegated.

## TDD

- Mode: on for the new infra assertions (RED before the stack edits, then GREEN).
- Source: this feature, from the review.
- Runner: `pnpm --filter infra test` (`tsx --test`). Also `pnpm --filter infra typecheck` and `pnpm --filter infra exec cdk synth` with `CDK_DEFAULT_ACCOUNT=111111111111` and `CDK_DEFAULT_REGION=us-east-1`.

## Acceptance

- Synth template has no `AWS::SecretsManager::Secret`, one API route (`$default`), no `Custom::CDKBucketDeployment`, and a `DistributionId` output.
- Docs no longer tell operators to create `APP_SECRET_ARN` or to build `client/dist` before synth.
- Local HS256 docs still mention `JWT_SECRET`.

## Progress

- Forecast: under 400 authored lines.
- Delivery: ask-on-risk. No commit.
- RED (`pnpm --filter infra test`, exit 1, before stack edits): 5 tests, 0 pass, 5 fail.
  - `ApiStack does not create a Secrets Manager secret` — Expected 0 `AWS::SecretsManager::Secret` but found 1.
  - `ApiStack Lambda environment has Cognito and media keys only` — `JWT_SECRET` present (`true !== false`).
  - `ApiStack registers a single $default HTTP API route` — Expected 1 `AWS::ApiGatewayV2::Route` but found 2.
  - `WebStack does not deploy the client bundle` — Expected 0 `Custom::CDKBucketDeployment` but found 1.
  - `WebStack publishes DistributionId` — Template has 0 outputs named DistributionId.
- Assertion correction: `resourceCountIs('AWS::Lambda::Function', 0)` cannot pass while `autoDeleteObjects` stays on the site bucket (`RemovalPolicy.DESTROY` is out of scope). After `BucketDeployment` was removed, the only Lambda is `CustomS3AutoDeleteObjectsCustomResourceProviderHandler`. The test now asserts that single provider. `hasOutput('DistributionId', { value: Match.anyValue() })` failed (`Missing key 'value'`); the matcher that matches the output is `{ Value: Match.anyValue() }`.
- GREEN (`pnpm --filter infra test`, exit 0): 5 tests, 5 pass, 0 fail.
- `pnpm --filter infra typecheck` exit 0.
- `CDK_DEFAULT_ACCOUNT=111111111111 CDK_DEFAULT_REGION=us-east-1 pnpm --filter infra exec cdk synth` exit 0.
- T1, T2, T3 done. Committed on `refactor/infra-drop-dead-secret`.
- Follow-up: tests synthesize each stack once and require the Lambda env keys to be exactly those five names. `pnpm --filter infra test` 5/5 and typecheck exit 0 after that edit. Manual deploy builds the client after the stacks exist, then syncs.
