# Client profile colocate + barrel cleanup

## Objective

Colocate leftover user/profile data access into `features/profile` (or `users`) and remove legacy `@/components` / `@/utilities` shims once unused — no “features + compat everywhere”.

## Problem

After screaming migration T0–T5, `useUser`, `useUserPosts`, and `user.service` (plus `files.service` if needed) still live under technical-layer `hooks/` and `services/`.

## Why

True feature locality; callers already import friends/feed from `@/features/*`.

## Scope

1. Colocate `useUser` + `user.service` into `features/profile` (this slice).
2. Later: `useUserPosts`, `files.service` if applicable.
3. Later: migrate `@/components` / `@/utilities` imports to `@/shared/*` and delete empty shims.

## Constraints

- Behavior-preserving; mirror `features/friends` layout (`api/`, `hooks/`, feature barrel).
- No new compatibility shims for moved files — update all imports and delete old paths.
- Keep `services/index.ts` re-export pattern for feature APIs (like friends/posts).
- Docs: update `docs/frontend-standards.md` structure when layout becomes real.
- TDD: ordinary checks; characterization for `previewShortCircuit.spec.ts`.

## TDD

- Mode: off for pure move; run existing client tests that touch moved seams.
- Source: project CLAUDE.md / this feature doc
- Runner: `pnpm --filter client test` / `pnpm --filter client typecheck`

## Delivery

- Strategy: `ask-on-risk`
- Branch: `feat/client-profile-colocate`
- Route: delegated writer (2+ files)

## Checklist

- [x] T1 Colocate `useUser` + `user.service` into `features/profile`; update callers/docs; no old-path shims
- [x] T2 Colocate `useUserPosts` (and posts user-fetch if still loose)
- [x] T3 `files.service` if it belongs with profile/users; else leave documented
- [x] T4 Kill unused `@/components` / `@/utilities` barrels after import migration to `@/shared/*`

## Progress

- T1 done (route=delegated). Verified: `pnpm --filter client typecheck` exit 0; `pnpm --filter client test` exit 0 (14 files / 63 tests, including previewShortCircuit). No commits. Next: T2.
- T2 done (route=delegated). Moved `useUserPosts` → `features/profile/hooks`; imports `fetchUserPostsService` from `@/features/feed/api` (service stays in feed). Deleted `client/src/hooks/`. Docs updated. Verified: typecheck + client test. No commits. Next: T3.
- T3 done (route=delegated). Rationale: not profile → auth (media/storage; sole live caller `authGateway` on sign-up). Moved `files.service.ts` → `features/auth/api/`; `services/index.ts` re-exports; deleted old path (no shim). Docs updated. Verified: typecheck + client test. No commits. Next: T4.
- T4 done (route=delegated). Migrated all `@/utilities`, `@/utilities/cognitoMode`, `@/interceptors`, `@/styled-components` imports (incl. vi.mock/doMock/doUnmock) to `@/shared/*`. Deleted shim trees `client/src/components/`, `utilities/`, `interceptors/`, `styled-components/`. Docs: removed compat barrels; paths + boundary point at `@/features/*` / `@/shared/*` only. Verified: legacy alias grep zero; typecheck + client test. No commits. Feature complete.
