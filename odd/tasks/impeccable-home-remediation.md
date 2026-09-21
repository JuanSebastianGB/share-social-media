# Feature: impeccable-home-remediation

## Objective

Close the Home critique backlog (14/40 Poor) via adapt → distill → clarify → harden → polish.

## Problem

Signed-in Home fails Operate + "The Signed-In Proof": mobile buries feed, fake/dead chrome, wrong brand, silent failures, token drift.

## Why

User authorized full-scope remediation after critique (`all at once`).

## Scope

- Target: `client/src/pages/Home` and related Home chrome (Navbar, Posts, Friends, UserInfo, Scroll, ErrorContent, Trends).
- Preserve: North Star The Signed-In Proof, Ember/Cool Paper/Soft Canvas, social loop, MUI stack.
- Out of scope: redesign visual world, invent Trends data, wire Message/Help/Notifications backends.

## Constraints

- English UI only.
- Brand: Share Social Media / S.S.Media (never "S. Social M." or "social media share").
- Dead chrome: **gone until real** (not Sample stubs).
- Client has no automated tests; verify via typecheck/lint.
- Commits: only when user requests (user rule overrides ODD work-unit commits for this session unless asked).

## TDD

- Mode: off (client has no test stack; source: project CLAUDE.md).
- Runner: N/A for client; use `pnpm --filter client typecheck` / root lint as functional checks.

## Delivery

- Branch: `feat/impeccable-home-remediation`
- Strategy: ask-on-risk (default); no PR until user asks.
- Route: delegated writer (2+ non-trivial files; mapping already done via CodeGraph).

## Checklist

- [x] T1 adapt — mobile feed-first (`Homelayout.tsx`)
- [x] T2 distill — remove Trends usage, vanity impressions, dead nav/Share icons
- [x] T3 clarify — brand + compose/empty/error copy
- [x] T4 harden — unfriend confirm + feedback; human errors; pending states
- [x] T5 polish — Publish contained/loading; Scroll/ErrorContent tokens; ramp drift; close critique snapshot

## Acceptance

- Mobile first viewport prioritizes AddPost/Posts.
- No fake Trends panel; no Message/Help/Notifications/Share dead controls; no Who's viewed / Impressions vanity rows.
- Navbar mark is S.S.Media with accessible Share Social Media name.
- Unfriend requires confirm; failures surface human copy; Publish shows loading and errors.
- Scroll/ErrorContent use theme tokens; icon sizes use MUI variants / DESIGN.md ramp where practical.
- Critique snapshot closed when Priority Issues cleared.

## Progress

- T1–T5 implemented on `feat/impeccable-home-remediation` (15 client files).
- Typecheck: `pnpm --filter client exec tsc --noEmit` pass.
- Commits: pending user request.
- Next: user review / commit / re-run `/impeccable critique home`.

## Verification evidence

- Typecheck exit 0 after writer pass.
- Spot-checked: Homelayout `column`, NavbarLeft `S.S.Media`, Home without Trends, Modal loading+contained, Scroll theme tokens, ErrorContent paper+error.
