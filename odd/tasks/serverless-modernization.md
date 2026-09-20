# Serverless modernization

## Objective
Modernize share-social-media: TypeScript monorepo, ESLint, characterization tests, GitHub Actions CI/CD, AWS CDK serverless (HTTP API + Lambda + S3/CloudFront).

## Problem
Legacy JS Express + Vite client with no CI, lint, IaC, or real tests.

## Scope
- Phase 1: pnpm workspaces, server TS, Lambda/local entrypoints, ESLint/Prettier
- Phase 2: Characterization tests (HTTP seams)
- Phase 3: GitHub Actions CI/CD (OIDC)
- Phase 4: CDK ApiStack + WebStack
- Phase 5: README + docs

## Constraints
- Keep Express via @codegenie/serverless-express
- MongoDB Atlas + Cloudinary (not DocumentDB)
- No UI redesign
- User commit policy: no commits unless requested

## TDD
Mode: off (characterization after TS foundation). Runner: Jest + supertest. 30 tests green.

## Route
Delegated direct (writer + QA). Mapping trigger: 4+ files.

## Checklist
- [x] T1 phase1-workspace-ts — server TS, workspaces, ESLint/Prettier, handler.ts
- [x] T2 phase2-characterization — 30 Jest characterization tests, mongodb-memory-server
- [x] T3 phase3-ci-cd — `.github/workflows/ci.yml` + `cd.yml` (OIDC)
- [x] T4 phase4-cdk — ApiStack + WebStack, synth OK
- [x] T5 phase5-docs — README, docs/development.md, docs/deployment.md

## Progress
All phases complete. Verified: lint (0 errors), typecheck, server tests 30/30, client build, cdk synth.
