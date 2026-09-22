# Feature: Local frontend preview

## Objective

Let the SPA register and log in from the existing forms, then open Home and Profile, without Cognito or the API.

## Problem

Routes open only when Redux has a token. Home then calls `useUser`; a failed user fetch with `ERROR_GET_USER` logs the session out. Register also calls `createDefault()` and `/auth/register`. A fake token alone cannot show the modules.

## Why

The user wants to exercise the frontend locally, at least registration, type credentials in the forms, and reach the modules. The API may be down.

## Scope

- In: dev-only `VITE_LOCAL_PREVIEW=true`; session built from the form; Home and Profile render for that user with empty posts and friends
- Out: mocking writes (new post, likes, friend toggle), Cognito, server changes, production builds
- Remediation (authorized): collapse scattered hook `if (isLocalPreviewEnabled())` into session helper + service short-circuit; clear preview storage on logout; explicit `useUser` mismatch error

## Constraints

- Flag is ignored unless `import.meta.env.DEV` is true
- When the flag is off, login, register, and data hooks stay on the current Cognito or HS256 path
- When the flag is on, it wins over Cognito env so the forms do not call AWS
- Do not store the password
- English-only artifacts
- No commit (unless user asks)

## TDD

- Mode: on for preview module and service short-circuit seams
- Source: feature task + thermo-nuclear remediation
- Runner: `pnpm --filter client test` and `pnpm --filter client typecheck`

## Route

Delegated writer. Trigger: remediation touches `localPreview`, services, hooks, and `authSlice` (2+ non-trivial files).

## Checklist

- [x] **T1** — Preview session module (flag, user from form, localStorage) with failing-then-passing Vitest — route: delegated
- [x] **T2** — Login and register use that session and skip the network when the flag is on — route: delegated
- [x] **T3** — `useUser`, `usePosts`, `useFriends`, `useUserPosts` skip the network and return the preview user or empty lists — route: delegated
- [x] **T4** — Document the flag and turn it on in the local `client/.env` — route: delegated
- [x] **T5** — Session helper `createLocalPreviewSession*` + Vitest; thin login/register branches only — route: delegated
- [x] **T6** — Service-layer preview short-circuit (`fetchUser` / posts / friends / userPosts); remove preview `if`s from data hooks — route: delegated
- [x] **T7** — `makeLogout` clears preview storage; mismatch id throws so `useUser` sets error — route: delegated
- [x] **T8** — `pnpm --filter client test` and `typecheck` green — route: delegated

## Acceptance

- Flag/DEV behavior unchanged
- Builders omit password; storage round-trip + clear work
- `createLocalPreviewSessionFromLogin` / `FromRegister` save user and return `{ token: LOCAL_PREVIEW_TOKEN, userFound }`
- Data hooks have **no** `isLocalPreviewEnabled` branches; preview returns come from services
- `fetchUserService` in preview: matching id → preview user; mismatch/missing → throws (no silent undefined)
- Empty lists from `fetchPostsService`, `fetchUserPostsService`, `fetchFriendsService` when preview on (no HTTP)
- `makeLogout` clears `LOCAL_PREVIEW_STORAGE_KEY`
- Login/register still early-return when preview on (do not call Cognito/API); use session helper
- `pnpm --filter client test` and `pnpm --filter client typecheck` pass

## Progress

### T1 evidence

- **RED:** `pnpm --filter client exec vitest run src/utilities/localPreview.spec.ts` — Failed to resolve import `./localPreview` (module missing). Exit 1.
- **GREEN:** same command — 9 tests passed. Exit 0.
- Spec uses an in-memory `localStorage` stub because Node 25 exposes a non-functional global `localStorage` that breaks jsdom.

### T2–T4 evidence

- Hooks wired: `useLogin`, `useRegister`, `useUser`, `usePosts`, `useFriends`, `useUserPosts`.
- Docs/env: `vite-env.d.ts`, `client/.env.example`, `client/.env` (`VITE_LOCAL_PREVIEW=true`), README, `docs/frontend-standards.md`, `docs/development_guide.md`.
- `pnpm --filter client test` — 13 files, 53 tests passed. Exit 0.
- `pnpm --filter client typecheck` — `tsc --noEmit` Exit 0.

### Remediation trigger

Thermo-nuclear review of uncommitted work: scattered hook branches, dual storage without logout clear, silent `useUser` mismatch, duplicated login/register session wiring.

### T5–T8 evidence

- **T5 RED:** `vitest run src/utilities/localPreview.spec.ts` — 4 failed (`createLocalPreviewSession*` / `resolvePreviewUserOrThrow` not functions). Exit 1.
- **T5–T7 GREEN (seams):** same + `previewShortCircuit.spec.ts` + `authSlice.characterization.spec.ts` — 21 passed. Exit 0.
- Session helpers + `resolvePreviewUserOrThrow` in `localPreview.ts`; login/register use session helpers; services short-circuit; data hooks have no `isLocalPreviewEnabled`; `makeLogout` calls `clearLocalPreviewUser()`.
- **T8:** `pnpm --filter client test` — 14 files, 63 tests passed. Exit 0. `pnpm --filter client typecheck` — Exit 0.

## Next step

Remediation complete. No commit unless user asks.
