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
- [x] **T6** — Server Cognito verify + profile signup path; retire password login (route: delegated; C2)
- [x] **T7** — Client Cognito sign-up/sign-in + profile + env (route: inline; C3) — dual-mode SPA + CD `VITE_COGNITO_*`
- [x] **T8** — Test harness + auth characterization for Cognito (route: delegated; C4) — dual-mode harness + cognito-mode characterization with T6; full JWKS Cognito token mocks deferred (HS256 path covers CI)
- [x] **T9** — Docs pass (README, deployment, infra README) aligned with final architecture

## Progress

- Tracker: `feat/infra-hardening-auth` (`ab10533`)
- Chain tips (each targets previous):
  1. `feat/infra-hardening-auth-01-jwt-harden` — T1+T2
  2. `feat/infra-hardening-auth-02-cd` — T3
  3. `feat/infra-hardening-auth-03-media-cf` — T4
  4. `feat/infra-hardening-auth-04-cognito-cdk` — T5
  5. `feat/infra-hardening-auth-05-cognito-server` — T6 (+ T8 harness)
  6. `feat/infra-hardening-auth-06-cognito-client` — T7
  7. `feat/infra-hardening-auth-07-docs-cd-cognito` — T9 + CD Cognito env
- Next: open draft tracker PR + chained child PRs
- Delivery: `feature-branch-chain`
- RDD assess: unavailable on cursor runtime (record per commit)

## Decisions

- Cognito verification in Express via `aws-jwt-verify` (not API GW authorizer) — preserves public GETs + local Jest against Express
- Dual-mode: `COGNITO_USER_POOL_ID` + `COGNITO_CLIENT_ID` both set → Cognito access-token verify; else HS256 `JWT_SECRET` (Jest/memory)
- App user PK stays generated id; store `cognitoSub` + pointer item `PK=COGNITO#sub / SK=LINK` for lookup (GSI2 already used by posts)
- Session: `checkValidJwt` requires DynamoDB profile; `checkAuthToken` allows missing profile for `POST /auth/profile`
- Custom UI retained (no Hosted UI)
- PR chain: feature-branch-chain
- Actor identity for mutations comes from JWT `_id` (`req.userData`); body/path `userId`/`id` no longer trusted for create post, like, comment, friend toggle
- CD: Api deploy → resolve `ApiUrl` + Cognito outputs → client build → Web deploy
- Media: private S3 + CloudFront OAC; `MEDIA_BASE_URL` = CloudFront domain
- Client dual-mode: `VITE_COGNITO_*` + region → Cognito + `/auth/profile`; else HS256 register/login
- Login profile fetch: `POST /auth/profile` short-circuits when Cognito sub already linked

## Verification evidence

- **T1+T2** `1f96e0b`: `pnpm --filter server test` → 36 passed (later 39 with Cognito harness)
- **T3** `6cc8d60`: CD Api→URL→client→Web
- **T4** `678bb55`: media CloudFront OAC; synth + 36 tests
- **T5** `75d6f71`: Cognito User Pool + SPA client; synth OK; `JWT_SECRET` kept for dual-mode
- **T6** `0082f1b`: `aws-jwt-verify` dual-mode + `POST /auth/profile`; 39 tests
- **T7** `53a6cc0`: client Cognito dual-mode; client typecheck/build OK; 39 tests
- **T8**: covered by T6 `cognito-mode.characterization.test.ts` + HS256 suites (live JWKS Cognito mocks deferred)
- **T9**: README / deployment / infra README / CD Cognito bake-in on this branch
