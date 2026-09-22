# Client services barrel + adapter cleanup

## Objective

Finish leftover technical-layer cleanup after profile colocate: delete `services/` barrel, colocate/park `user.adapter`, remove dead `fetchFiles`, fix stale frontend-standards paths.

## Problem

`services/` is a re-export-only barrel with zero `@/services` callers; `adapters/user.adapter.ts` holds one live helper (`userLoginAdapter`) plus dead `userAdapter`; docs still describe `services/*.ts`.

## Why

Same standard as hooks/components/utilities: features + shared only, no empty compat layers.

## Scope

1. Move `previewShortCircuit.spec.ts` out of `services/`, delete `services/`.
2. Colocate `userLoginAdapter` into `features/auth/model`; delete dead `userAdapter` and `adapters/`.
3. Remove unused `fetchFiles`; update `docs/frontend-standards.md`.

## Constraints

- Behavior-preserving except deleting proven-unused exports (`fetchFiles`, `userAdapter`).
- Spec must keep passing under Vitest `src/**/*.{test,spec}.{ts,tsx}`.
- TDD: ordinary checks — typecheck + client tests.

## TDD

- Mode: off for moves/deletes; run existing characterization specs.
- Source: this feature doc / CLAUDE.md
- Runner: `pnpm --filter client test` / `pnpm --filter client typecheck`

## Delivery

- Strategy: `ask-on-risk`
- Branch: `feat/client-services-barrel-cleanup`
- Route: inline (resume after interrupted delegation)

## Checklist

- [x] T1 Kill `services/` barrel; relocate `previewShortCircuit.spec.ts`
- [x] T2 Colocate `userLoginAdapter` into auth model; delete `adapters/`
- [x] T3 Drop `fetchFiles`; fix stale `services/*.ts` docs lines

## Progress

- Complete. Spec → `shared/lib/utilities/previewShortCircuit.spec.ts`; deleted `services/` and `adapters/`; `userLoginAdapter` in `features/auth/model/user.adapter.ts`; removed `fetchFiles`; docs updated. Verified: typecheck + 63 tests. No commits yet.
