# Feature: Client unit / component tests (no e2e)

## Objective

Client automated tests under **juancho global `qa-expert`** (`~/.config/opencode/skills/qa-expert`): strategist + delegated skills. Skip e2e (`e2e-agent`).

## Problem

Initial suite used wrong skill (`daymade/claude-code-skills@qa-expert`). Conventions (file names, characterization vs unit, component.spec, naming) and docs must match the global skill.

## Why

User (2026-09-20): use **their** global qa-expert, not daymade.

## Scope

- In: Vitest scaffold (keep); reclassify tests per decision tree; `*.characterization.spec.*` for legacy seams; `*.component.spec.tsx` for ErrorBoundary; optional PBT on Yup schemas; docs/strategy aligned to global skill; remove daymade artifacts
- Out: E2E; mutation testing (later quality-gate slice); full page/form component suite; backend integration

## Strategy (global qa-expert)

| Area | Type | Skill |
|------|------|-------|
| Redux slices, cognitoMode, formatDate, themeConfig, Yup schemas | Characterization (legacy AS-IS) | `characterization-testing` |
| ErrorBoundary | Component | `component-testing` |
| Schema invariants (password/body rules) | Property-based + companion examples | `property-based-testing` |
| E2E | Deferred | `e2e-ia` / e2e-agent |

## Constraints

- English-only artifacts
- No nested client lockfile
- Do not commit `.agents/` or daymade `skills-lock.json`
- Commits only when user requests

## TDD

- Mode: **on** for new/changed test files
- Runner: `pnpm --filter client test`

## Checklist

- [x] **T1** — Vitest/RTL scaffold + CI (kept)
- [x] **T2–T4** — Initial suite (daymade-shaped; superseded by T5+)
- [x] **T5** — Remove daymade docs/install noise; `client/tests/docs/TEST-STRATEGY.md` points at global qa-expert; deleted `.agents/skills/qa-expert/` + root `skills-lock.json`
- [x] **T6** — Reclassified to `*.characterization.spec.ts` + `ErrorBoundary.component.spec.tsx`; naming `{scenario} — {outcome}`
- [x] **T7** — `fast-check` (client devDependency via root pnpm); `auth.schema.property.spec.ts` + `post.schema.property.spec.ts` with `{ numRuns: 100 }`
- [x] **T8** — Updated `docs/frontend-standards.md`, `docs/development_guide.md`, this file

## Acceptance

- Conventions match global qa-expert + delegated skills
- No daymade TC-WEB / Google-process docs as authority
- `pnpm --filter client test` green
- E2E still absent

## Progress

- Branch: `feat/client-unit-tests`
- **Evidence (2026-09-20):** `pnpm --filter client test` → **12 files, 43 tests, all passed**; `pnpm --filter client typecheck` → **pass**
  - Characterization: 9 files / 35 tests
  - Component: 1 file / 3 tests
  - Property: 2 files / 5 tests

## Next step

Ready for user review / commit when requested.
