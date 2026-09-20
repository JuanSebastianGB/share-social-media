# Higiene: rename `defaulstorage` → `defaultstorage`

## Goal
Fix the long-standing path typo. `/defaulstorage` becomes `/defaultstorage` everywhere it is declared, mounted, or called. Historical mentions in standards docs and the ADR stay untouched (immutable history).

## Tasks

### T1 — RED characterization test
File: `server/tests/storage-default.characterization.test.ts`

Add a test that asserts `GET /defaultstorage` (the new path) is mounted and behaves like the legacy `/defaulstorage` endpoint (creates the DEFAULT_IMAGE_ID row and returns the file metadata). The test uses `app` from `testApp.ts` (same setup as the rest of the characterization suite).

Currently RED: the path doesn't exist yet, so the request returns 404.

### T2 — GREEN: rename in 3 files
1. `docs/api-spec.yml` — rename the path `/defaulstorage:` → `/defaultstorage:` and update the description line ("Legacy typo path (defaulstorage). Creates DEFAULT_IMAGE_ID storage row if missing." → "Creates DEFAULT_IMAGE_ID storage row if missing.")
2. `server/app.ts` — `app.use('/defaulstorage', createDefault)` → `app.use('/defaultstorage', createDefault)`
3. `client/src/services/files.service.ts` — `Api.get('/defaulstorage')` → `Api.get('/defaultstorage')`

After this edit the existing test for the legacy path (if any) must keep passing; if the codebase has no test for the legacy path, that's fine — the new test in T1 covers the new path.

`pnpm contract:check` (from #75) must report `OK:` (no drift) after the rename.

### T3 — verify + commit + PR
- `pnpm contract:check` — no drift
- `pnpm --filter server test` — 215/215 + new characterization test pass
- `pnpm --filter client build` — succeeds (Vite catches missing imports)
- `pnpm --filter server typecheck` — clean
- `pnpm --filter server lint` — clean
- Conventional Commits: `refactor(contract): rename /defaulstorage to /defaultstorage`
- Branch: `feat/higiene-rename-defaulstorage`
- One work-unit commit.

## Out of scope (intentionally NOT changed)
- `docs/backend-standards.md` — mentions the typo in policy/historical context. Stays.
- `docs/frontend-standards.md` — same.
- `docs/adr/0004-media-ddd-hexagonal.md` — ADR is immutable.
- `ai-specs/agents/backend-developer.md` + `frontend-developer.md` — agent instructions; they describe the previous policy. Update in a follow-up if needed.
- `odd/tasks/higiene-contrato-deuda.md` + `higiene-contract-drift.md` — historical task docs.

## Evidence
- Test: `server/tests/storage-default.characterization.test.ts` — passes (RED → GREEN).
- 3 files renamed: `docs/api-spec.yml` (path + description), `server/app.ts` (mount), `client/src/services/files.service.ts` (call).
- `pnpm contract:check` exits 0 (22 paths, no drift).
- Server tests pass (215 + 1 new). Typecheck + lint clean.
- Client build succeeds.
