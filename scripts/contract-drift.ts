#!/usr/bin/env tsx
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Resolve bare imports from the server package (scripts/ is not a workspace
// package; a local scripts/node_modules symlink is gitignored and absent in CI).
const requireFromServer = createRequire(
  new URL('../server/package.json', import.meta.url),
);
const express = requireFromServer('express') as typeof import('express');
const YAML = requireFromServer('js-yaml') as typeof import('js-yaml');

// Swagger UI itself is not part of the API contract.
const INTERNAL_PREFIXES = ['/documentation', '/documentation.json'];

export function normalizeOpenApiPath(p: string): string {
  const stripped = p.replace(/\{(\w+)\}/g, ':$1').replace(/\/+$/, '');
  return stripped === '' ? '/' : stripped;
}

export function extractSpecPaths(spec: {
  paths?: Record<string, unknown>;
}): string[] {
  return Object.keys(spec.paths ?? {}).map(normalizeOpenApiPath);
}

interface RouteLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
  };
  name?: string;
  regexp?: { source?: string; fast_slash?: boolean };
  handle?: { stack?: RouteLayer[] };
}

function mountPathFromRegexp(layer: RouteLayer): string {
  if (layer.regexp?.fast_slash) return '';
  const source = layer.regexp?.source ?? '';
  const match = source.match(/\^\\\/([^\\\?]+)/);
  return match ? '/' + match[1].replace(/\\\//g, '/') : '';
}

export function extractAppPaths(app: express.Express): string[] {
  const out = new Set<string>();
  const walk = (stack: RouteLayer[], prefix = ''): void => {
    for (const layer of stack) {
      if (layer.route) {
        const raw = `${prefix}${layer.route.path}`;
        const path = raw.replace(/\/+$/, '') || '/';
        for (const [m, enabled] of Object.entries(layer.route.methods)) {
          if (enabled) out.add(`${m.toUpperCase()} ${path}`);
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        walk(layer.handle.stack, prefix + mountPathFromRegexp(layer));
      } else {
        // Middleware-mounted path (e.g. `app.use('/path', handler)`). Treat as
        // supporting GET since `app.use` accepts every method but the OpenAPI
        // spec only declares a single verb per path.
        const mount = mountPathFromRegexp(layer);
        if (mount) out.add(`GET ${mount}`);
      }
    }
  };
  walk((app as unknown as { _router: { stack: RouteLayer[] } })._router.stack);
  return [...out];
}

export function drift(
  specPaths: string[],
  appPaths: string[],
): { missingInApp: string[]; missingInSpec: string[] } {
  const specSet = new Set(specPaths);
  const appByPath = new Map<string, string[]>();
  for (const ap of appPaths) {
    const [m, ...rest] = ap.split(' ');
    const p = rest.join(' ');
    if (!appByPath.has(p)) appByPath.set(p, []);
    appByPath.get(p)!.push(m);
  }
  const filteredApp = appPaths.filter((ap) => {
    const p = ap.split(' ').slice(1).join(' ');
    return !INTERNAL_PREFIXES.some((pref) => p === pref || p.startsWith(pref + '/'));
  });
  return {
    missingInApp: specPaths
      .filter((p) => !appByPath.has(p))
      .map((p) => `GET ${p}`), // ponytail: missingInApp reports GET as a hint; add method-level check later
    missingInSpec: filteredApp.filter((ap) => !specSet.has(ap.split(' ').slice(1).join(' '))),
  };
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const specPath = resolve(here, '../docs/api-spec.yml');
  const spec = YAML.load(readFileSync(specPath, 'utf8')) as {
    paths?: Record<string, unknown>;
  };
  // Set memory endpoint BEFORE importing app so transitive services do not
  // require real DynamoDB at module load.
  process.env.DYNAMODB_ENDPOINT ??= 'memory';
  process.env.TABLE_NAME ??= 'ShareSocialMedia';
  process.env.MEDIA_ENDPOINT ??= 'memory';
  process.env.MEDIA_BUCKET ??= 'test-bucket';
  process.env.MEDIA_BASE_URL ??= 'https://media.local';
  process.env.AWS_REGION ??= 'us-east-1';
  process.env.JWT_SECRET ??= 'test-jwt-secret';
  process.env.PUBLIC_URL ??= 'http://localhost:3000';
  // server/app.ts resolves the spec via a relative path that breaks when run
  // from source (it is intended for the built dist tree). Inject the absolute
  // path so server/app.ts finds the spec regardless of build state.
  process.env.OPENAPI_SPEC_PATH ??= specPath;
  const { app } = await import('../server/app.js');
  const result = drift(extractSpecPaths(spec), extractAppPaths(app));
  if (result.missingInApp.length === 0 && result.missingInSpec.length === 0) {
    console.log(`OK: api-spec.yml matches server routes (${extractSpecPaths(spec).length} paths).`);
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

const entry = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : '';
if (entry && import.meta.url === entry) {
  main();
}
