# Higiene: contrato — slice 02 (drift detection CI)

## Goal
Catch contract drift between `docs/api-spec.yml` and the actual Express routes mounted in `server/app.ts`. Drift fails CI on every PR.

## Tasks

### T1 — RED: failing test for the comparison logic
File: `scripts/contract-drift.test.ts`

The detector has three pure functions:
- `normalizeOpenApiPath(path)`: `'/users/{id}/friends'` → `'/users/:id/friends'`
- `extractSpecPaths(spec)`: `Object.keys(spec.paths ?? {})` normalized
- `extractAppPaths(app)`: walks `app._router.stack` and nested routers, returns `METHOD path` strings (e.g. `"GET /users/:id/friends"`)
- `drift(specPaths, appPaths)`: returns `{ missingInApp: string[], missingInSpec: string[] }`

Test cases (synthetic spec + app, no real server):
- Empty spec, empty app → empty drift
- Spec has `/foo`, app has GET `/foo` → no drift
- Spec has `/users/{id}`, app has GET `/users/:id` → no drift (param normalized)
- Spec has `/foo`, app has nothing → `missingInApp: ['/foo']`
- App has GET `/bar`, spec has nothing → `missingInSpec: ['GET /bar']`
- Spec excludes internal Swagger path → no drift for those

These are unit tests against the pure functions. The script (`main()`) is exercised by `pnpm contract:check` against the real app + spec; if drift exists at the time of merge (it shouldn't after #74), the script prints it and exits 1.

### T2 — GREEN: detector script
File: `scripts/contract-drift.ts`

```ts
#!/usr/bin/env tsx
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import YAML from 'js-yaml';

const INTERNAL_PREFIXES = ['/documentation']; // Swagger UI itself, not API

export function normalizeOpenApiPath(p: string): string {
  return p.replace(/\{(\w+)\}/g, ':$1').replace(/\/+$/, '') || '/';
}

export function extractSpecPaths(spec: { paths?: Record<string, unknown> }): string[] {
  return Object.keys(spec.paths ?? {}).map(normalizeOpenApiPath);
}

export function extractAppPaths(app: express.Express): string[] {
  const out = new Set<string>();
  const walk = (stack: any[], prefix = ''): void => {
    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .filter((m) => layer.route.methods[m])
          .map((m) => m.toUpperCase());
        for (const m of methods) {
          out.add(`${m} ${prefix}${layer.route.path}`);
        }
      } else if (layer.name === 'router' && layer.handle.stack) {
        let mount = '';
        const match = layer.regexp?.source?.match(/\^\\\/([^\\]+)/);
        if (match) mount = `/${match[1]}`;
        walk(layer.handle.stack, prefix + mount);
      }
    }
  };
  // ponytail: _router is internal but stable across Express 4.x
  walk((app as any)._router.stack);
  return [...out];
}

export function drift(
  specPaths: string[],
  appPaths: string[],
): { missingInApp: string[]; missingInSpec: string[] } {
  const specSet = new Set(specPaths);
  const appSet = new Set(appPaths);
  const filteredApp = appPaths.filter((p) => {
    const path = p.split(' ')[1];
    return !INTERNAL_PREFIXES.some((pref) => path.startsWith(pref));
  });
  return {
    missingInApp: specPaths.filter((p) => !appSet.has(p)).map((p) => `GET ${p}`),
    missingInSpec: filteredApp.filter((p) => !specSet.has(p.split(' ')[1])),
  };
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const specPath = resolve(here, '../docs/api-spec.yml');
  const spec = YAML.load(readFileSync(specPath, 'utf8')) as { paths?: Record<string, unknown> };
  const { app } = await import('../server/app.js');
  const result = drift(extractSpecPaths(spec), extractAppPaths(app));
  if (result.missingInApp.length === 0 && result.missingInSpec.length === 0) {
    console.log('OK: api-spec.yml matches server routes (no drift).');
    process.exit(0);
  }
  console.error('Contract drift detected:');
  if (result.missingInApp.length) {
    console.error(`  In spec, missing in server (${result.missingInApp.length}):`);
    for (const p of result.missingInApp) console.error(`    ${p}`);
  }
  if (result.missingInSpec.length) {
    console.error(`  In server, missing in spec (${result.missingInSpec.length}):`);
    for (const p of result.missingInSpec) console.error(`    ${p}`);
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

### T3 — wire it up
- Root `package.json`: add `"contract:check": "tsx scripts/contract-drift.ts"` to scripts.
- `tsconfig.json` (repo root): add `scripts/` to `include` so tsc finds it. Check if root tsconfig exists; if so, add it. If not, leave (tsx handles it standalone).
- `.github/workflows/ci.yml`: add step `Contract drift check` after `Test`, before `Build server`.

### T4 — verify + commit + PR
- `pnpm contract:check` → must report no drift
- `pnpm --filter server test` → must still pass
- `pnpm typecheck` → clean
- `pnpm lint` → clean (new file linted)
- Conventional Commits: `ci(contract): fail CI on api-spec.yml vs server drift`
- Branch: `feat/higiene-contract-drift`
- One work-unit commit.

## Out of scope
- Method-level drift (a path can have GET in YAML and only POST in Express). Add when needed.
- Stale `@openapi` JSDoc (gone after #74).
- Renaming `defaulstorage` (separate slice).

## Evidence
- Drift status (verified locally): 0 missing in app, 0 missing in spec.
- All unit tests pass (10 contract-drift tests + existing 215 server tests).
- Typecheck + lint clean.
- Contract drift check exits 0 against current main.
