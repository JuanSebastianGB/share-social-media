---
description: Standards and best practices for technical documentation in this project, including documentation structure, update processes, and language rules.
globs:
alwaysApply: true
---
# Rules and Patterns for documentation and AI specs

## Introduction

Technical documentation applies to all the documentation relative to the project, such as the data model, README, API specs, and other MD docs that describe how the project is structured, runs, and operates.

AI specs refers to the documents that explain AI agents how to behave, document, plan, code, etc, which includes team agreements, standards and conventions.

## General rules

- ALWAYS WRITE IN ENGLISH, including comments and any explanation in the files. This applies both to creating new documentation and updating existing one, and it also applies to documentation within the code (comments, explanations of functions or fields, etc.).

## Documentation map (this repository)

| Document | Role | Notes |
|----------|------|-------|
| [`README.md`](../README.md) | Product overview, quick start, env tables | Keep high-level; link out for depth |
| [`docs/development.md`](./development.md) | Existing short monorepo/tooling/test notes | **Do not overwrite** casually; keep in sync with reality |
| [`docs/deployment.md`](./deployment.md) | CDK, secrets, CI/CD, cost, teardown | **Do not overwrite** casually; authoritative for AWS deploy |
| [`docs/development_guide.md`](./development_guide.md) | Fuller setup/run/test guide for agents and humans | Complements `development.md`; avoid contradictory commands |
| [`docs/pull-requests.md`](./pull-requests.md) | How to open a pull request | Canonical. Linked from `base-standards.md` |
| [`docs/base-standards.md`](./base-standards.md) | Single source of truth for AI agents | |
| [`docs/backend-standards.md`](./backend-standards.md) | Server conventions | |
| [`docs/frontend-standards.md`](./frontend-standards.md) | Client conventions | |
| [`docs/data-model.md`](./data-model.md) | DynamoDB single-table model | |
| [`docs/api-spec.yml`](./api-spec.yml) | OpenAPI 3 contract of record | Prefer over `server/docs` Swagger |
| [`infra/README.md`](../infra/README.md) | CDK stacks overview | |

When two guides overlap (`development.md` vs `development_guide.md`), prefer **accurate commands** and update both if you change setup steps.

## Technical Documentation

Before making any commit or git push, or if you're asked to document a commit, you must ALWAYS review which technical documentation should be updated.

When updating documentation, I will:

1. Review all recent changes in the codebase
2. Identify which documentation files need updates based on the changes. Clear examples:
   - For data model changes: update entity sections in `data-model.md`
   - For API changes: update `api-spec.yml` (and note if server Swagger remains stale)
   - For install/tooling/env changes: update `development_guide.md`, `development.md`, and/or `README.md` as appropriate
   - For AWS/CDK/CI changes: update `deployment.md` and `infra/README.md`
   - For coding convention changes: update the relevant `*-standards.md` and `base-standards.md` links if needed
3. Update each affected documentation file in English, maintaining consistency with existing documentation
4. Ensure all documentation is properly formatted and follows the established structure
5. Verify that all changes are accurately reflected in the documentation
6. Mark **legacy** and **planned** explicitly — never present planned endpoints/entities as implemented
7. Report which files were updated and what changes were made

## AI specs

This rule establishes a mandatory process for the AI to:

- Learn from user feedback, guidance, and suggestions during interactions.
- Identify opportunities to improve existing Development Rules based on these learnings proactively.
- Keep the AI's assistance aligned with evolving project needs and user expectations.
- Incorporate user feedback into the AI's operational framework to maximize its value.

This rule is applicable after any interaction where the user provides explicit or implicit feedback, suggestions, corrections, new information, or expresses preferences. **The AI MUST actively analyze all user interactions for such learning opportunities, not only passively waiting for direct feedback, to proactively refine its understanding and the project's best practices.**

### Common Pitfalls and Anti-Patterns to be avoided by the AI

- **Skipping Approval Process:** Applying rule modifications without obtaining explicit user review and approval first.
- **Unlinked Proposals:** Proposing rule changes without clearly connecting them to the specific user feedback or insights gained from the interaction.
- **Imprecise Modifications:** Suggesting modifications without precisely identifying which rule or specific sections within a rule should be changed, hindering effective user review.
- **Unaddressed Feedback:** Not initiating the learning and review process when the user provides relevant feedback that could improve the rules.
- **Scope Creep:** Updating multiple unrelated rules simultaneously or making changes that exceed the scope of the feedback received.
- **Unprompted Rule Changes:** Modifying rules proactively when there is no direct connection to user feedback or a learning opportunity. Rule updates should be reactive and feedback-driven.
- **Missing Update Confirmation:** Failing to notify the user after a rule modification has been successfully implemented following their approval.
- **Inventing stack:** Documenting libraries or endpoints that are not in the repo (e.g. treating unused RHF/SWR as standard).
- **Overwriting protected guides:** Replacing `docs/development.md` or `docs/deployment.md` wholesale when a complementary update would suffice.
