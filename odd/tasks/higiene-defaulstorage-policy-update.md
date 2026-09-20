# Higiene: actualizar menciones de policy tras rename de `defaulstorage`

## Goal
Sincronizar las menciones del typo en los standards docs y las instrucciones de agentes, ahora que el rename está en `main`. La política "no fix sin coordinación" ya no aplica — reflejar el estado actual.

## Tasks

### T1 — 6 targeted edits

#### Edit 1: `docs/backend-standards.md:167`
Current:
```
**Compliant:** `controllers/storage.ts` → Media module facade (`modules/media` / `services/storage.ts` re-export) → Dynamo adapter. Soft-delete is domain then save; hard-delete orchestrates object-store cleanup outside the domain. Keep `/storage` and `/defaulstorage` HTTP contracts unchanged.
```
Replace with:
```
**Compliant:** `controllers/storage.ts` → Media module facade (`modules/media` / `services/storage.ts` re-export) → Dynamo adapter. Soft-delete is domain then save; hard-delete orchestrates object-store cleanup outside the domain. Keep `/storage` and `/defaultstorage` HTTP contracts unchanged.
```

#### Edit 2: `docs/backend-standards.md:309`
Current:
```
| `/defaulstorage` | none | **Legacy typo path** — ensures default image row |
```
Replace with:
```
| `/defaultstorage` | none | Default file bootstrap — idempotent: first call creates DEFAULT_IMAGE_ID row, subsequent return null |
```

#### Edit 3: `docs/backend-standards.md:567`
Current:
```
| `/defaulstorage` typo | Real mounted path | Keep path for client compat; do not “fix” spelling without client change |
```
Replace with:
```
| `/defaultstorage` | Default file bootstrap | Idempotent endpoint — do not change return shape without updating client |
```

#### Edit 4: `docs/frontend-standards.md:309`
Current:
```
| `/defaulstorage` client call | Matches server typo | Keep spelling until coordinated rename |
```
Replace with:
```
| `/defaultstorage` client call | Default file bootstrap | Called during register; idempotent (null on subsequent calls) |
```

#### Edit 5: `ai-specs/agents/backend-developer.md:84`
Current:
```
- Do not “fix” `/defaulstorage` spelling, Scan lists, or open auth gaps without tests +
  explicit product intent
```
Replace with:
```
- Do not change `Scan` lists, open auth gaps, or other shared behavior without tests
  + explicit product intent
```

#### Edit 6: `ai-specs/agents/frontend-developer.md:45`
Current:
```
  Preserve calls to `/defaulstorage` spelling unless a coordinated rename is in scope.
```
Replace with:
```
  Preserve calls to backend URLs as declared in `docs/api-spec.yml`. If a rename is in
  scope, coordinate the client with the server in the same PR.
```

### T2 — verify
- `pnpm contract:check` → must still exit 0 (no code changes, but sanity check)
- `pnpm --filter server test` → must still pass
- `pnpm --filter server typecheck` → must still pass
- `pnpm --filter server lint` → must still pass
- `grep -rn "defaulstorage" --include="*.md" docs/ ai-specs/` → must return zero matches in these updated files

### T3 — commit + PR
- Conventional Commits: `docs(standards): update defaulstorage references after rename`
- Branch: `docs/higiene-defaulstorage-policy-update`
- One work-unit commit.

## Intentionally NOT changed
- `docs/adr/0004-media-ddd-hexagonal.md` — ADR is immutable
- `odd/tasks/higiene-*.md` — historical task docs
- The current api-spec.yml description for `/defaultstorage` already says "Called by the client during register. Do not rename without a coordinated client change." (paraphrased), which still applies as a guideline.

## Evidence
- 6 references updated: `docs/backend-standards.md` (3), `docs/frontend-standards.md` (1), `ai-specs/agents/backend-developer.md` (1), `ai-specs/agents/frontend-developer.md` (1).
- `grep -rn defaulstorage docs/ ai-specs/` (excluding ADR + this tracker) returns zero matches.
- `pnpm contract:check`, server test, typecheck, lint all still pass.
