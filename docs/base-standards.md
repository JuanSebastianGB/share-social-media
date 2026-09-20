---
description: This document contains all development rules and guidelines for this project, applicable to all AI agents (Claude, Cursor, Codex, Gemini, etc.).
alwaysApply: true
---

## 1. Core Principles

- **Small tasks, one at a time**: Always work in baby steps, one at a time. Never go forward more than one step.
- **Test-Driven Development**: For **new** functionality, start with failing tests (TDD) according to the task details.
  - **Reality (as-is):** the suite today is **Jest characterization tests** under `server/tests/` that lock existing HTTP behavior. Prefer extending those for legacy paths; use proper RED→GREEN→REFACTOR TDD when adding new behavior.
  - The **client has no automated tests** today. Do not invent a client test stack in a change unless the task explicitly adds one.
- **Type Safety**: All code must be fully typed (TypeScript). Server uses NodeNext ESM (`.js` extensions on relative imports). Client uses Vite + TypeScript.
- **Clear Naming**: Use clear, descriptive names for all variables and functions.
- **Incremental Changes**: Prefer incremental, focused changes over large, complex modifications.
- **Question Assumptions**: Always question assumptions and inferences.
- **Pattern Detection**: Detect and highlight repeated code patterns.
- **Document reality**: Prefer describing and extending what the codebase does today. Mark **legacy** and **planned** explicitly; never present planned work as implemented.

## 2. Language Standards

- **English Only**: All technical artifacts must always use English, including:
  - Code (variables, functions, classes, comments, error messages, log messages)
  - Documentation (README, guides, API docs)
  - Issue/ticket titles, descriptions, comments
  - Data schemas and database names
  - Configuration files and scripts
  - Git commit messages
  - Test names and descriptions

## 3. Specific standards

For detailed standards and guidelines specific to different areas of the project, refer to:

- [Backend Standards](./backend-standards.md) — Express API, DynamoDB single-table, Cognito dual-mode auth, testing, security
- [Frontend Standards](./frontend-standards.md) — Vite React SPA, MUI, Redux auth slice, Formik+Yup, Cognito client
- [Documentation Standards](./documentation-standards.md) — Technical documentation structure, formatting, and maintenance guidelines, including AI standards like this document
- [Data Model](./data-model.md) — DynamoDB single-table entities and access patterns
- [API Spec](./api-spec.yml) — OpenAPI 3 contract of record (handlers; server Swagger is stale)
- [Development Guide](./development_guide.md) — Setup, env, tests (complements existing [development.md](./development.md) and [deployment.md](./deployment.md))

## 4. Project Skills

- Skills live in `ai-specs/skills` when present.
- When a request matches a skill, load and follow the corresponding `SKILL.md` automatically before continuing.
- Also load any referenced files in the skill folder (for example, `references/*.md`) when the skill requires them.

## 5. Symlink Integrity and Multi-Agent Portability

- **Canonical Source**: Keep reusable artifacts in `ai-specs` as the canonical source. Agent-specific paths (such as `.claude` and `.cursor`) should reference them through symlinks when possible.
- **Update Safety**: Whenever a file is renamed, moved, or its suffix changes, verify and update all symlinks that target it before considering the change complete.
- **New Artifact Linking**: Whenever creating a new artifact that requires multi-agent exposure (for example new agents or skills in `ai-specs`), create the corresponding symlinks from the expected agent-specific reference paths.
- **External Customization Review**: Whenever customization is introduced outside `ai-specs`, evaluate whether it should be moved into `ai-specs` and replaced with symlinks from the original locations.
- **Completion Gate**: A change is incomplete if it leaves broken symlinks, stale targets, or duplicated canonical artifacts across agent-specific folders.

## 6. Monorepo and tooling facts (quick reference)

- **Workspace**: pnpm `@9.12.0` — packages `client`, `server`, `infra`. Root `pnpm-lock.yaml` is authoritative; nested `client/pnpm-lock.yaml` / `server/pnpm-lock.yaml` are **legacy** and must not be used for installs.
- **Node**: engines `>=20`; CI uses Node 20.
- **No Docker** for application runtime or default CI. **Exception:** Docker is allowed for server integration tests (`test:integration` / DynamoDB Local via Testcontainers).
- **Commits**: Conventional Commits (`feat/`, `ci/`, `docs/`, …). Branches: `feat/<topic>[-NN-slice]`.
- **CI** (`.github/workflows/ci.yml`): lint, typecheck, server tests, builds, `cdk synth`. **CD**: OIDC deploy on `main`. No Husky.
- **Prettier** is present (`.prettierrc`) but there is **no format script and no format step in CI**.
- **ESLint** flat config at repo root; `infra/**` is eslint-ignored.
