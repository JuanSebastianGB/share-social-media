# Infra hardening + Cognito auth

## Objective

Ship all three authorized tracks on `feat/infra-hardening-auth`:

- **A** — Tighten auth on mutations + bind identity from token; wire CD `VITE_APP_BASE_URL`
- **B** — Serve media via CloudFront (OAC); remove public `uploads/*` GetObject
- **C** — Cognito User Pool (no Hosted UI) + DynamoDB profiles; verify with `aws-jwt-verify` in Express

## Problem

Auth is partially wired but ignored on likes/deletes/comments; CD can ship a SPA with undefined API base; media is world-readable on S3; passwords/JWT are custom while Cognito is the desired identity end-state.

## Why

Portfolio-grade serverless demo: real authorization, safer media delivery, managed identity — without rewriting the Express catch-all design.

## Scope

### In

- JWT (then Cognito access tokens) on mutating routes; `userId` from `req.userData`, not body
- Reorder `/posts/file` so auth runs before S3 upload
- CD: Api URL → client build → Web deploy; later `VITE_COGNITO_*`
- Media CloudFront + OAC; `MEDIA_BASE_URL` → distribution domain
- Cognito User Pool + public app client; client SignUp/SignIn; server profile completion after Cognito; drop server password login
- Characterization tests updated with behavior; docs

### Out

- Hosted UI / social IdPs (follow-up)
- Multi-account / multi-stage CDK (hard-coded table name stays unless a later task)
- WAF / custom domains

## Constraints

- Keep HTTP API `/{proxy+}` → single Lambda; **no** default API Gateway JWT authorizer (would block public GETs)
- Custom Auth UI stays; Cognito API from client
- TDD: **off** (not project-configured); runner `pnpm --filter server test`; ordinary functional checks required
- Delivery strategy: **feature-branch-chain** (user 2026-09-19)
- Forecast authored lines: **~1800–2200** (exceeds ~400) → chained PRs off prior feature PR
- Slice plan (initial): PR1 T1–T2 (auth harden); PR2 T3 (CD); PR3 T4 (media CF); PR4 T5–T8 (Cognito); PR5 T9 docs if needed — adjust to ~400 authored lines per PR

## Authorized scope

User (2026-09-19): “I want them all” for A + B + C.

## Acceptance criteria

1. Unauthenticated like/delete/comment/friend-toggle → 401; authenticated actor matches token subject/profile id
2. Production CD builds client with real API base (and Cognito env after C)
3. Media URLs use CloudFront; bucket has no public `AnyPrincipal` GetObject on `uploads/*`
4. Register/login identity via Cognito; DynamoDB profile + avatar still work; `pnpm --filter server test` green
5. Docs/README/infra README match deployed shape

## Applicable checks

- `pnpm --filter server test`
- `pnpm typecheck` / `pnpm lint` as touched
- `pnpm --filter infra exec cdk synth` when infra changes
- RDD: enabled (global) — `gentle-ai review assess` after each work-unit commit

## Checklist

- [x] **T1** — Auth harden routes + bind `userId` from JWT; JWT before S3 on `/posts/file` (route: delegated; A1)
- [x] **T2** — Update characterization tests for T1 (route: delegated; A2)
- [x] **T3** — CD wire `VITE_APP_BASE_URL` (Api output / GitHub var → client build → Web) (route: inline; CD1)
- [x] **T4** — Media CloudFront + OAC in Api stack; remove public policy; env/docs (route: delegated; B1+B2)
- [x] **T5** — CDK Cognito User Pool + app client + outputs/env (route: delegated; C1 — serialize vs T4 on `api-stack.ts`)
- [ ] **T6** — Server Cognito verify + profile signup path; retire password login (route: delegated; C2)
- [ ] **T7** — Client Cognito sign-up/sign-in + profile + env (route: delegated; C3)
- [ ] **T8** — Test harness + auth characterization for Cognito (route: delegated; C4)
- [ ] **T9** — Docs pass (README, deployment, infra README) aligned with final architecture

## Progress

- Tracker: `feat/infra-hardening-auth` (`ab10533`)
- PR1 branch: `feat/infra-hardening-auth-01-jwt-harden` (`1f96e0b` T1+T2)
- PR2 branch: `feat/infra-hardening-auth-02-cd` (T3)
- PR3 branch: `feat/infra-hardening-auth-03-media-cf` (T4)
- PR4 branch: `feat/infra-hardening-auth-04-cognito-cdk` (T5)
- Next: T6 (server Cognito verify + profile path)
- Delivery: `feature-branch-chain`
- Authored lines so far (PR1 vs tracker): 224; PR2/PR3 pending commit

## Decisions

- Cognito verification in Express via `aws-jwt-verify` (not API GW authorizer) — preserves public GETs + local Jest against Express
- Custom UI retained (no Hosted UI)
- T4 and T5 both touch `api-stack.ts` — serialize (T4 then T5) or single infra PR owning that file
- PR chain: feature-branch-chain
- Actor identity for mutations comes from JWT `_id` (`req.userData`); body/path `userId`/`id` no longer trusted for create post, like, comment, friend toggle
- CD deploys Api first, resolves `ApiUrl` (or `vars.VITE_APP_BASE_URL`), builds client, then deploys Web
- Media: private S3 + CloudFront OAC; `MEDIA_BASE_URL` = `https://<MediaDistributionDomainName>`; `s3Upload` unchanged (pathname parse works for CF hosts)

## Verification evidence

- **T1+T2** commit `1f96e0b`: `pnpm --filter server test` → 5 suites / 36 tests passed. Unauthenticated mutations return `401` + `ERROR_EXPECTED_BEARER`. Public GETs remain open. RDD assess unavailable on cursor runtime.
- **T3**: CD workflow reordered (Api → resolve URL → client build → Web). Docs updated. No runtime AWS deploy in CI for this slice.
- **T4**: ApiStack media CloudFront + OAC; public `AnyPrincipal` GetObject removed; `MEDIA_BASE_URL` → CF domain. Docs/.env.example updated. `cdk synth` OK (dummy account); `pnpm --filter server test` → 5 suites / 36 tests passed. No commit (per task).
- **T5**: ApiStack Cognito User Pool (email sign-in, self sign-up, auto-verify email) + public SPA client (`USER_PASSWORD`/`USER_SRP`, no secret, no Hosted UI). Lambda env `COGNITO_*`; outputs `UserPoolId`/`UserPoolClientId`. `JWT_SECRET` kept. `cdk synth` OK (dummy account). No commit (per task).
