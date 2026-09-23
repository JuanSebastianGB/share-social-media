# ci-role-as-code — Turn external `share-social-media-github-cd` IAM role into CDK

## Goal

The GitHub Actions CD workflow (`cd.yml`) fails on the `Publish site` step
because the external IAM role assumed via OIDC has no permissions on the
WebStack's S3 bucket or CloudFront distribution. Today that role is created
out-of-band (manual / pre-existing IaC), so its permissions drift.

This change brings the role into CDK as `CIRoleStack`, with permissions
derived from `WebStack.siteBucket` and `WebStack.siteDistribution` via CDK
grant helpers, and has `cd.yml` resolve the role ARN from the new stack
output instead of a hard-coded secret.

## Why

- **Root cause, not symptom.** Hard-coding more permissions into an external
  role, or adding `s3:*` wildcards, would fix the symptom but leave the
  source of the bug (drift between hand-managed IAM and CDK-managed infra)
  in place.
- **Single source of truth.** Role creation and permission grants become
  reproducible from a clean AWS account, side by side with the resources
  they apply to.
- **CDK grant helpers over hand-written statements.** `grantReadWrite`
  composes the exact set of actions required by `s3 sync --delete`. Future
  helpers (e.g. newer CDK methods) flow automatically. Eliminates a class
  of "almost-right" `PolicyStatement`s.

## Where

- `infra/lib/ci-role-stack.ts` — new file (already authored).
- `infra/lib/web-stack.ts` — exposes `siteBucket` and `siteDistribution`.
- `infra/bin/app.ts` — instantiates `CIRoleStack` after `WebStack`.
- `.github/workflows/cd.yml` — bootstraps with the legacy role, deploys the
  new role stack, re-assumes via the resolved `RoleArn`, then proceeds.
- `infra/tests/stacks.test.ts` — new tests for the role stack.

## Learned

- **Bootstrap chicken-and-egg.** The role that lets CI assume into AWS
  cannot create itself. The first deploy of `ShareSocialMediaCiRole` must
  be done with local admin credentials OR by leaning on the existing
  external role for one round, then switching to the new role.
  Implementation: the workflow keeps the existing
  `secrets.AWS_ROLE_ARN` step to deploy `ShareSocialMediaCiRole`, then
  uses the resolved output to re-assume.
- **`condition: environment` mirrors workflow.** The trust policy checks
  `token-actions.githubusercontent.com:environment == production`, which
  requires `environment: production` on the job (already present). This
  is what prevents forks / PRs from other repos from minting a token that
  satisfies the trust policy.
- **CDK `grantReadWrite` ≈ the operations `aws s3 sync --delete` performs.**
  `ListBucket` on the bucket, plus `Get/Put/DeleteObject` on its objects.
  No need to hand-roll those statements.

## Bootstrap (manual, one-time)

```bash
# from /home/juancho/projects/aws/share-social-media/infra
export AWS_PROFILE=<admin-profile>
pnpm exec cdk synth ShareSocialMediaCiRole
pnpm exec cdk deploy ShareSocialMediaCiRole --require-approval never
```

After that, CI keeps the role up to date on every push to `main` that
touches `infra/**`. The old external role `share-social-media-github-cd`
becomes unused; remove the `AWS_ROLE_ARN` secret only after that step.

## Validation evidence

(populated as the worker reports back)
