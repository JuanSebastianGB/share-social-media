# Higiene: contrato / deuda — slice 01

## Goal
Eliminar la deuda del Swagger viejo del server y dejar **una sola fuente de verdad** para el contrato HTTP: `docs/api-spec.yml`.

## Estado actual (reality)
- `docs/api-spec.yml` (1251 líneas, OpenAPI 3.0.3) es el contrato de récord. Documenta 25 paths.
- `server/docs/swagger.ts` sirve un swagger viejo basado en JSDoc con 1 schema (`user`) y 3 paths (solo los `@openapi` en `routes/users.ts`).
- `app.ts` línea 38 monta `swaggerUi.setup(swaggerSetup)` desde el archivo viejo.
- 3 bloques `@openapi` JSDoc en `routes/users.ts` declaran status `422` para errores (el real es `403`).
- Deps mantenidas por el swagger viejo: `swagger-jsdoc` + `@types/swagger-jsdoc`.

## Tasks

### T1 — Characterization test RED
Archivo: `server/tests/documentation.characterization.test.ts`

GET `/documentation.json` debe devolver el spec de `docs/api-spec.yml`. Aserciones:
- Status 200
- `Content-Type: application/json`
- `paths` tiene ≥ 25 entradas
- Incluye `/auth/register` (NO está en el swagger viejo)
- Incluye `/items/{id}` (NO está en el swagger viejo)

Estado esperado: **RED** contra el swagger viejo actual.

### T2 — GREEN: reemplazar swagger loader
- Borrar `server/docs/swagger.ts`.
- En `server/app.ts`: importar `yaml` (o `js-yaml`), leer `docs/api-spec.yml` resolviendo relativo a `import.meta.url`, pasar el objeto a `swaggerUi.setup(spec)`.
- Mantener `swagger-ui-express`. Quitar import de `./docs/swagger.js`.

Estado esperado: **GREEN** — T1 pasa.

### T3 — Cleanup: JSDoc muerto + deps muertas
- Borrar los 3 bloques `@openapi` en `server/routes/users.ts` (líneas 16-66, 69-98 aprox).
- Quitar de `server/package.json`: `swagger-jsdoc`, `@types/swagger-jsdoc`.
- Agregar `yaml` (o `js-yaml`) como dep directa.
- Actualizar `pnpm-lock.yaml`.

Estado esperado: lint + typecheck + tests pasan.

### T4 — Commit + push + PR
- Conventional Commits: `refactor(server): serve api-spec.yml at /documentation`.
- Branch: `feat/higiene-contrato-deuda`.
- Tests + lockfile + JSDoc removal en un solo work-unit commit.

## Out of scope (siguientes slices)
- Typo `defaulstorage` → `defaultstorage` (archivo aparte).
- Drift detection CI entre handlers y el YAML.
- Auth dual-mode (Cognito on/off) — feature, no deuda.

## Evidence
- T1 RED → T2 GREEN → T3 cleanup landed on branch `feat/higiene-contrato-deuda`.
- Test: `server/tests/documentation.characterization.test.ts` — passes against `docs/api-spec.yml` (22 paths).
- Deleted: `server/docs/swagger.ts`, 3 `@openapi` JSDoc blocks in `server/routes/users.ts`.
- Removed deps: `swagger-jsdoc`, `@types/swagger-jsdoc`. Added direct dep: `js-yaml`.
- Typecheck + lint + characterization test green. Full unit suite green.
- Commit SHA: 9d3eecc
- PR #: TBD en T4
