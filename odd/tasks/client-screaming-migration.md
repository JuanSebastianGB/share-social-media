# Client Screaming Architecture Migration

## Objective

Migrate the React client from technical-layer folders to feature-first (Screaming Architecture) with Clean seams inside features and Atomic Design only under `shared/ui`.

## Problem

`client/src` screamed React/Redux/Axios; feature logic was scattered; UI components called services directly; dead `HomeProvider`.

## Why

Maintainability and domain locality; align with thermo-nuclear review and accepted plan.

## Scope

Phases 0–5 per plan: Home context delete → feed hooks → `features/feed` → `features/auth` → friends/profile → `shared/ui` + barrels.

## Constraints

- Behavior-preserving; no second store / form library.
- Work-unit commits per phase.
- Update `docs/frontend-standards.md` when a new layout becomes real.
- TDD: ordinary checks (client Vitest) when touching tested files; typecheck otherwise.

## TDD

- Mode: off for pure moves / deletions; characterization where tests exist.
- Source: project CLAUDE.md
- Runner: `pnpm --filter client test` / `pnpm --filter client typecheck`

## Delivery

- Strategy: `ask-on-risk`; phase commits on `feat/client-screaming-architecture`.

## Checklist

- [x] T0 Delete HomeProvider / unwrap Home — `bb5f619`
- [x] T1 Extract feed mutation hooks; zero services in Posts UI — `72d2eda`
- [x] T2 Colocate `features/feed`; slim barrel; update standards — `0ae527b`
- [x] T3 Auth gateway + `features/auth` — `23fed93`
- [x] T4 `features/friends` + presentational UserInfo — `eddcc91`
- [x] T5 `shared/ui` + `shared/lib`; thin compatibility barrels

## Progress

- Complete. Typecheck + 63 tests green after T5.
- Next: open PR when ready.
