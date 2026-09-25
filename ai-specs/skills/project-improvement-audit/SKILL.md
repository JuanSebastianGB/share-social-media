---
name: project-improvement-audit
description: "Trigger: improvement audit, improvement backlog, auditoría de mejoras, qué mejorar del proyecto. File the confirmed top 5 as GitHub issues."
license: Apache-2.0
metadata:
  author: JuanSebastianGB
  version: "1.1"
---

## Activation Contract

Load this skill when the user asks for an improvement audit or an improvement backlog.

## Hard Rules

- Read the spine before any recommendation. Cite a repository path for every finding. Mark **legacy** and **planned** explicitly.
- Take the lenses from the dropdown options in `.github/ISSUE_TEMPLATE/improvement-audit.yml`. Keep at most 3 evidenced findings per lens. A lens with no citation is `none`. Keep at most 3 uncited product hypotheses, in chat only.
- Assign one primary lens per finding. Rank at most 5 by leverage: higher impact and lower implementation effort first.
- Recommend a new AWS service only when HTTP API, Lambda, DynamoDB, S3, CloudFront, and Cognito do not cover the case. Cost is implementation effort. When the lens is `aws`, add service cost only when evidence exists.
- File only the confirmed top 5. Leave application code, infrastructure, and markdown backlogs unchanged. Publish only after one explicit yes to the exact five titles and `github.com/JuanSebastianGB/share-social-media`, by following the installed `issue-creation` skill and the issue form.

## Execution Steps

1. Read `README.md`, `docs/base-standards.md`, `docs/backend-standards.md`, `docs/frontend-standards.md`, `docs/data-model.md`, `docs/api-spec.yml`, and `docs/deployment.md`.
2. Attach code evidence for each candidate. Drop any candidate you cannot cite.
3. Fill the per-lens pool, then choose the top 5.
4. In the user's language, report each lens (`none` or the cited findings), the top 5, and any hypotheses.
5. Show the five English titles and the target repository. Wait for one yes to that batch.
6. On yes, create one issue per accepted title by following `issue-creation` and the issue form.

## Output Contract

Return the per-lens pool, the top 5, any hypotheses, and either "waiting for confirmation" or the `issue-creation` result.

## References

- `.github/ISSUE_TEMPLATE/improvement-audit.yml` — lens options and the body of every filed ticket.
