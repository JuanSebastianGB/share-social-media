# feat-legacy-cleanup: pay down documented technical debt

## Goal

Remove the legacy items explicitly flagged in AGENTS.md but never paid down:

1. **`vercel.json`** — README says "Not Vercel" but the file exists with `deploymentEnabled: false`. Dead config.
2. **`client/pnpm-lock.yaml` + `server/pnpm-lock.yaml`** — AGENTS.md says "must not be used for installs". Verified: pnpm with workspace config ignores them; they're stale orphans (server's has `mongoose` which the project doesn't use anymore; client's has `@hookform/resolvers` which isn't used).
3. **`MONGO_IMAGE_ID`** — `@deprecated` alias of `DEFAULT_IMAGE_ID`, defined in `constants/constants.ts`. Single call site in `controllers/posts.ts:87`. Replace + delete the alias.

## Constraints

- **Zero behavior change**. pnpm must keep working from the root lockfile.
- **Zero test edits**. All characterization tests must pass byte-for-byte.
- **CI / build / deploy must still work** (verified by running typecheck + lint + tests).

## Tasks

### T1 — Delete vercel.json
- One-line removal. README already documents "Not Vercel".

### T2 — Replace MONGO_IMAGE_ID with DEFAULT_IMAGE_ID
- Update `server/controllers/posts.ts:87` to import and use `DEFAULT_IMAGE_ID`.
- Delete the `MONGO_IMAGE_ID` constant from `server/constants/constants.ts`.
- Verify no other source usages (only `dist/` build output remains; will be regenerated).

### T3 — Delete nested lockfiles
- Delete `client/pnpm-lock.yaml` and `server/pnpm-lock.yaml`.
- Run `pnpm install --frozen-lockfile` from root to verify the root lockfile still resolves all dependencies.
- Run `pnpm --filter server test` and `pnpm --filter client test` to verify nothing broke.

### T4 — Final verification
- `pnpm typecheck` (all 3 packages)
- `pnpm lint` (server + client; infra is eslint-ignored per config)
- `pnpm --filter server test`
- `pnpm --filter client test`
- `cd server && pnpm build` — verify server builds (regenerates dist/ without the deleted constant)

## Commit plan

One work-unit commit (or two if T4 verification reveals anything to fix).

## Risk

**Low overall**:
- vercel.json: dead file, no runtime impact.
- MONGO_IMAGE_ID: alias to DEFAULT_IMAGE_ID, single call site, identical runtime value.
- nested lockfiles: verified pnpm doesn't touch them when run with workspace config. The only risk is if a future developer runs `pnpm install` inside client/ or server/ and gets confused. AGENTS.md wording stays accurate.
