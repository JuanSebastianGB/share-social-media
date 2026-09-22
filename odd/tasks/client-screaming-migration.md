# Client Screaming Architecture Migration

## Objective

Migrate the React client from technical-layer folders to feature-first (Screaming Architecture) with Clean seams inside features and Atomic Design only under `shared/ui`.

## Problem

`client/src` screams React/Redux/Axios; feature logic is scattered; UI components call services directly; dead `HomeProvider`.

## Why

Maintainability and domain locality; align with thermo-nuclear review and accepted plan.

## Scope

Phases 0–5 per plan: Home context delete → feed hooks → `features/feed` → `features/auth` → friends/profile → `shared/ui` + barrels.

## Constraints

- Behavior-preserving; no second store / form library.
- No big-bang single PR of the whole tree (work-unit commits per phase).
- Update `docs/frontend-standards.md` when a new layout becomes real.
- TDD: project reality is characterization/component tests; extend where seams exist. Mode: ordinary checks (client Vitest) when touching tested files; functional smoke (typecheck/lint) otherwise.

## TDD

- Mode: off for pure moves / deletions; on (characterization) when changing hook contracts if tests exist.
- Source: project CLAUDE.md (characterization preferred for legacy).
- Runner: `pnpm --filter client test` / `pnpm --filter client typecheck`

## Delivery

- Strategy: `ask-on-risk` default; forecast ~800–1500 authored lines across all phases → slice by phase commits.
- Chain: stacked feature branch `feat/client-screaming-architecture`.

## Checklist

- [ ] T0 Delete HomeProvider / unwrap Home
- [ ] T1 Extract feed mutation hooks; zero services in Posts UI; decouple isFriend
- [ ] T2 Colocate `features/feed`; slim barrel; update standards
- [ ] T3 Auth gateway + `features/auth`
- [ ] T4 `features/friends` + presentational UserInfo
- [ ] T5 `shared/ui` + `shared/lib`; remove mega-barrel

## Progress

- Next: T0
- Commits: (none yet)
