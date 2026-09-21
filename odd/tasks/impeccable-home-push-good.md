# Feature: impeccable-home-push-good

## Objective

Push signed-in Home from Acceptable 27/40 toward Good 28+ by closing the two P1s: feed hierarchy authorship and search status + Clear.

## Problem

Post-C critique held at 27: equal-weight three columns still read as MUI social tutorial; active search has no status or Clear.

## Why

User authorized continuing the full Impeccable UI/UX refactor after PR #84 merge.

## Scope

- Target: Home layout, Posts/Navbar/Friends/UserInfo/AddPost/ErrorBoundary as Home chrome.
- Preserve: Signed-In Proof, Ember/Cool Paper/Soft Canvas, social loop, MUI stack, English UI, S.S.Media brand.
- Out of scope: inventing Trends/Message backends; full Auth redesign; new visual world (amplify only).

## Constraints

- Commits only when user requests.
- Client TDD off; characterization only where Redux clear is covered; typecheck/lint as functional checks.
- Dead chrome stays gone until real.
- Bolder: amplify existing tokens only — no new palette/fonts/shadow language.

## Spatial thesis

- Primary: compose + feed (AddPost → Posts).
- Secondary: identity + friends as one aside rail (not a third equal column).
- Desktop: feed-primary two-region layout; Soft Canvas behind Cool Paper panels; `justifyContent: flex-start` (not space-around).
- Narrow (≤900px): **feed-only Home** — aside rail deferred to Profile; search always in top chrome (not drawer-only).

## TDD

- Mode: off (client characterization only where Redux clear is covered).
- Runner: `pnpm --filter client typecheck`; optional `pnpm --filter client test` for slice spec.

## Delivery

- Branch: `feat/impeccable-home-push-good`
- Strategy: ask-on-risk; no PR until asked.
- Route: delegated writer (2+ files; mapping via CodeGraph + explore).

## Checklist

- [x] T1 layout+distill — feed-primary aside rail; Homelayout alignment
- [x] T2 clarify+harden — active search status + Clear (Navbar + feed); empty-match copy
- [x] T3 polish leftovers — friend remove aria; unused Trends only if touched
- [x] T4 verify — typecheck; detect layout/Home targets; re-critique Home
- [x] T5 adapt — mobile: chrome search always visible; Home hide aside (feed-only); distill drawer search dupe
- [x] T6 verify — typecheck; detect; re-critique Home toward higher Good
- [x] T7 bolder — amplify Home surfaces with existing ember/type tokens (AddPost, UserInfo, Friends)
- [x] T8 adapt — mobile Home profile/friends path (compact, no aside return)
- [x] T9 quieter — compact NavbarMenu (not hollow full-height drawer)
- [x] T10 onboard+harden — empty/help copy; ErrorBoundary → ErrorContent Try again
- [x] T11 verify — typecheck; detect; re-critique

## Progress

- T1–T11 done. Scores: 27 → 30 → 31 → **32/40 Good**.
- **Merged to main:** PR #85 (`e0fe556`). Feature branch deleted locally.
- Remaining P1 (future): category surface authorship beyond Amplify.

## Verification evidence

- typecheck exit 0; detect `[]`; ErrorBoundary vitest 3/3
- Critique dual-agent post backlog: **32/40**; browser skipped
