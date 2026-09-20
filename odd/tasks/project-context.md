# Feature: project-context

## Objective

Produce AI agent project context documents (`docs/` standards, `data-model.md`, `api-spec.yml`, `development_guide.md`, agent role defs) and wire them via symlinks so Cursor/Claude/Codex/Gemini load a single source of truth.

## Problem

Agents fall back to generic advice; the repo has real conventions (dual Cognito/local auth, DynamoDB single-table, characterization tests) that are not wired into agent entrypoints.

## Why

User ran `/project-context` and confirmed **brownfield**. OpenSpec not present — skip OpenSpec artifacts.

## Scope

**In:**
- New: `docs/base-standards.md`, `backend-standards.md`, `frontend-standards.md`, `documentation-standards.md`, `data-model.md`, `api-spec.yml`, `development_guide.md`
- New: `ai-specs/agents/backend-developer.md`, `frontend-developer.md`
- Wiring: root symlinks, `.cursor/rules/use-base-rules.mdc`, agent symlinks under `.claude/agents/` and `.cursor/agents/`
- Keep existing `docs/development.md`, `docs/deployment.md` (extras)

**Out:**
- OpenSpec init / openspec-tasks doc
- `product-strategy-analyst` agent (no product-strategy workflow requested)
- Overwriting existing deployment/development guides without accepted diffs
- Code/behavior changes

## Constraints

- Document reality as-is; mark planned/legacy explicitly
- English artifacts only
- Never copy example fiction content
- No `{{` placeholders or `> Fill:` leftovers
- Remove OPENSPEC-ONLY blocks from base-standards
- Commits only if user explicitly requests (user commit rule)

## Authorized scope

User confirmed brownfield classification and authorized investigation + generation (2026-09-20).

## Acceptance criteria

- Verification gate in skill `references/verification.md` passes
- Dominant patterns documented; legacy called out
- API schemas align with data-model entities

## Applicable checks

- File existence, symlink resolve, YAML parse, no placeholders, cross-refs, internal consistency

## TDD

- Mode: **off** (docs-only feature; source: no test runner for docs)
- Runner: n/a

## Delivery

- Strategy: `ask-on-risk` → user accepted **`size:exception`** (single PR; api-spec alone exceeds 400)
- PR: https://github.com/JuanSebastianGB/share-social-media/pull/36
- Branch: `feat/project-context`
- Commits: `30ae30d`, `c7452f1`

## Next step

Wait for CI / review / merge.

## Route

- Investigation: delegated explore (6 tracks) — done
- Writing: delegated writer (writer trigger: 2+ non-trivial files)
- Wiring/verify: parent

## Tasks

- [x] T1 Classify + confirm brownfield (no OpenSpec)
- [x] T2 Investigate stack, backend, frontend, data, API, testing/workflow
- [x] T3 Write standards docs + data-model + api-spec + development_guide + agents
- [x] T4 Create symlinks and Cursor rule wiring
- [x] T5 Run verification gate; report gaps

## Progress

- Classification confirmed by user
- Investigation reports received (6 parallel explores + codegraph)
- Writer produced 9 files; fixed agent example leaks (reservations → project-specific)
- Wiring: AGENTS/CLAUDE/GEMINI/codex → docs/base-standards.md; agents in .claude/.cursor; use-base-rules.mdc
- Verification: placeholders/OpenSpec/YAML/symlinks OK; no example fiction leak after agent fix
- Commits deferred (user rule)

## Verification evidence

- Symlinks resolve OK; root files are real symlinks
- api-spec.yml: 22 paths, 15 schemas
- No `{{`, `> Fill:`, `OPENSPEC-ONLY`
- Skipped: openspec-tasks, product-strategy-analyst

## Commit evidence

- Branch: `feat/project-context`
- Commit: `30ae30d` — `docs(ai): add project-context standards and agent wiring`

## Next step

Push / open PR when the user asks.
