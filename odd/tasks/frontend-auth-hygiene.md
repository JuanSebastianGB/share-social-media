# Feature: Frontend auth mega-slice hygiene (Option A)

## Objective

Extract posts, friends, and theme mode out of the Redux `auth` mega-slice into focused slices; remove unused RHF/SWR dependencies; keep Cognito dual-mode, HTTP services, and login/logout semantics unchanged.

## Problem

`authSlice` holds session + feed + friends + theme. Documented debt in `docs/frontend-standards.md`. Unused `react-hook-form`, `@hookform/resolvers`, and `swr` (only dead `useCheckToken`).

## Why

User authorized Option A (2026-09-20) after Catalog + contract higiene Done. Worktree: `feat/frontend-auth-hygiene`.

## Scope

- In: client Redux split (`postsSlice`, `friendsSlice`, `themeSlice`); persist migrate; remove dead deps + `useCheckToken`; update `frontend-standards.md` debt table
- Out: wiring `userSlice`, new client test stack, HTTP/Cognito changes, UI redesign, Formik→RHF

## Constraints

- Preserve login: clear posts/search/page; do **not** clear friends
- Preserve logout: clear posts/friends/search/page
- Keep persist root key `root` with versioned migrate
- English-only artifacts
- No client test stack invention

## TDD

- Mode: **off** (client has no automated tests; project reality)
- Source: docs/base-standards.md + frontend-standards.md
- Runner: `pnpm --filter client typecheck` / `pnpm --filter client build` / root lint

## Route

Delegated mapping (explore). Per-task: T1 inline; T2–T4 delegated writer (2+ non-trivial files).

## Checklist

- [x] **T1** — Remove unused RHF/resolvers/SWR + dead `useCheckToken` — route: inline — `e82eef2`
- [x] **T2** — Extract `postsSlice` (`posts`, `page`, `search`) + persist migrate for posts fields — route: delegated — `1e67fbc`
- [x] **T3** — Extract `friendsSlice` — route: delegated — `2baab3d`
- [ ] **T4** — Extract `themeSlice` (`mode`); finalize persist migrate; update frontend-standards — route: delegated

## Acceptance

- `store.auth` holds only session (`user`, `token`)
- Posts/friends/mode live in dedicated slices; selectors updated
- Login/logout semantics preserved
- Dead deps gone; build + typecheck + lint green
- Standards debt table updated

## Delivery

- Strategy: `ask-on-risk` (default)
- Forecast authored lines: ~280–420
- Worktree: `/home/juancho/projects/aws/share-social-media-worktrees/frontend-auth-hygiene`
- Branch: `feat/frontend-auth-hygiene` (from `main` @ `00a1f5c`)

## Progress

- Mapping complete (explore agent)
- Worktree created from `origin/main`
- T1 complete (`e82eef2`)
- T2 complete (`1e67fbc`) — postsSlice + persist migrate v2
- T3 complete (`2baab3d`) — friendsSlice + persist migrate v3

## Next step

T4 themeSlice extraction.
