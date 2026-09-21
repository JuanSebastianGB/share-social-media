# AWS hosting replace Vercel

## Objective

Serve the SPA from the existing AWS CDK path (S3 + CloudFront) instead of Vercel, with working CD (GitHub OIDC) and green CI. Never publish secrets.

## Problem

- Vercel GitHub integration still auto-deploys and fails status checks.
- AWS hosting already exists in CDK (`WebStack`, `ApiStack`) but stacks were never deployed; CD OIDC secrets are empty.
- CI fails on `contract:check` because `scripts/` bare imports resolve only via a local gitignored symlink to `server/node_modules`.

## Why

One AWS-native hosting path, aligned with existing IaC and CD, without Amplify duplication.

## Scope

- Fix `contract:check` dependency resolution for CI
- Create GitHub OIDC provider + least-privilege role (assume CDK bootstrap roles only)
- Configure GitHub secrets/vars without echoing secret values
- Deploy `ShareSocialMediaApi` + `ShareSocialMediaWeb`
- Point repo homepage to CloudFront; document disconnecting Vercel
- Verify CI green

## Out of scope

- Custom domain / ACM certificates
- Amplify Hosting
- Deleting the Vercel project (user action in Vercel dashboard)

## Constraints

- Account `318616156988`, region `us-east-1`, local AWS CLI `super-admin` authorized once
- Secrets only via Secrets Manager + GitHub encrypted secrets; no secret values in git, logs, or chat
- OIDC trust limited to this repository

## TDD

- Mode: off (characterization / ops); runner: `pnpm --filter server test`, `pnpm contract:check`
- Source: project reality (Jest characterization; no new TDD for infra)

## Delivery

- Strategy: `ask-on-risk` (default)
- Route: parent owns secret/OIDC/deploy; inline for CI fix + docs

## Checklist

- [x] T1 Create branch + this feature document
- [x] T2 Fix contract:check ESM resolution (no local symlink required)
- [x] T3 Create GitHub OIDC provider + CDK deploy role (least privilege)
- [x] T4 Set GitHub secrets/vars (no echoed values)
- [x] T5 Deploy Api + Web stacks; rotate app secret JSON safely
- [x] T6 Homepage → CloudFront; docs for leaving Vercel
- [ ] T7 Verify CI green; CD can assume role

## Progress

- Api + Web stacks deployed; SPA returns HTTP 200 on CloudFront.
- OIDC stack `ShareSocialMediaGithubOidc` created; GitHub secrets set via `gh secret set` (values not logged).
- `vercel.json` disables Vercel git deployments.
- Next: push PR and confirm CI green.

## Verification evidence

- `pnpm contract:check` OK without `scripts/node_modules` symlink
- CloudFront `DistributionDomainName` smoke HEAD → 200
- GitHub homepage updated to CloudFront URL
