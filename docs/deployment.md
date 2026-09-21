# Deployment guide

Low-cost serverless target for share-social-media.

## Architecture

- **API**: API Gateway HTTP API → Lambda (Node 20) running Express via `@codegenie/serverless-express`
- **Web**: S3 (private) + CloudFront (OAC) serving the Vite `client/dist` build
- **Database**: DynamoDB single-table (`ShareSocialMedia`), on-demand billing
- **Media**: S3 bucket (private) + CloudFront (OAC) for `uploads/*`
- **Secrets**: AWS Secrets Manager JSON secret (`JWT_SECRET`, `PUBLIC_URL`)
- **Auth**: Cognito User Pool + public SPA client (no Hosted UI); Express verifies access tokens when `COGNITO_*` are set
- **IaC**: AWS CDK TypeScript in [`infra/`](../infra/)

## One-time AWS setup

1. Install AWS CLI and authenticate (SSO or IAM user for bootstrap only).
2. Bootstrap CDK in the target account/region:

```bash
cd infra
npx cdk bootstrap aws://$ACCOUNT/$REGION
```

3. Create the GitHub Actions OIDC role (no long-lived AWS keys in the repo). Prefer the checked-in template:

   ```bash
   aws cloudformation deploy \
     --stack-name ShareSocialMediaGithubOidc \
     --template-file infra/github-oidc.yaml \
     --capabilities CAPABILITY_NAMED_IAM \
     --parameter-overrides GitHubOrg=<org> GitHubRepo=share-social-media
   ```

   The role may only assume CDK bootstrap roles (`cdk-hnb659fds-*`) and read stack outputs / bootstrap SSM parameters. Trust is limited to this repository (`main` + `production` / `Production` environments).

4. In the GitHub repo, configure (set via `gh secret set` / `gh variable set` — **never commit values**):
   - **Secret** `AWS_ROLE_ARN` — output `RoleArn` from `ShareSocialMediaGithubOidc`
   - **Secret** `AWS_ACCOUNT_ID` — 12-digit account id
   - **Variable** `AWS_REGION` — e.g. `us-east-1`
   - Optional **Secret** `APP_SECRET_ARN` — existing Secrets Manager ARN (otherwise the Api stack creates a placeholder secret)
   - Optional **Variable** `VITE_APP_BASE_URL` — override API URL for the client build (otherwise CD reads stack output `ApiUrl` after deploying `ShareSocialMediaApi`)
   - Optional **Variable** `VITE_APP_DEFAULT_IMAGE_ID` — default avatar/storage id baked into the client build
   - Optional **Variable** `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_AWS_REGION` — override Cognito SPA env (otherwise CD reads `UserPoolId` / `UserPoolClientId` from the Api stack and uses `vars.AWS_REGION`)

### Leaving Vercel

Production hosting is **S3 + CloudFront** (`ShareSocialMediaWeb`), deployed by CD. `vercel.json` disables Vercel Git deployments for this repo. Also disconnect the project in the Vercel dashboard (Git integration / remove project) so preview status checks stop. Do not store AWS or app secrets in Vercel.

## Application secrets

JSON keys expected by the Lambda (Secrets Manager):

| Key | Purpose |
|-----|---------|
| `JWT_SECRET` | JWT signing secret |
| `PUBLIC_URL` | Public API base URL (used by the app for file URLs) |

CDK also injects `TABLE_NAME`, `MEDIA_BUCKET`, `MEDIA_BASE_URL`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, and `AWS_REGION` as Lambda environment variables (not secrets).

After first deploy, update the placeholder secret values (stack output `AppSecretArn`) before real traffic.

## Deploy manually

```bash
pnpm install
pnpm --filter client build
pnpm --filter server build
cd infra
export CDK_DEFAULT_ACCOUNT=...
export CDK_DEFAULT_REGION=us-east-1
pnpm exec cdk diff
pnpm exec cdk deploy --all
```

Optional existing secret:

```bash
pnpm exec cdk deploy --all -c appSecretArn=arn:aws:secretsmanager:...
```

Stack outputs:

- `ApiUrl` — HTTP API endpoint (CD wires this into the client build; set `vars.VITE_APP_BASE_URL` to override)
- `UserPoolId` / `UserPoolClientId` — Cognito ids (CD wires `VITE_COGNITO_*`; override with GitHub vars if needed)
- `MediaBaseUrl` / `MediaDistributionDomainName` — CloudFront URL prefix for uploaded media (`MEDIA_BASE_URL`)
- `DistributionDomainName` — CloudFront domain for the SPA
- `AppSecretArn` — secrets ARN

### Media URL migration

After deploying this change, new uploads get `secure_url` values under the CloudFront host (`https://<distribution>.cloudfront.net/uploads/...`). Existing DynamoDB rows that still store `https://<bucket>.s3.<region>.amazonaws.com/uploads/...` will break for browser display once public GetObject is removed — re-upload those objects or rewrite stored URLs to the CloudFront base (object keys under `uploads/` are unchanged).

For a local production-like web build outside CD:

```bash
# client/.env.production
VITE_APP_BASE_URL=https://xxxx.execute-api.region.amazonaws.com
VITE_APP_DEFAULT_IMAGE_ID=<storage id>
VITE_COGNITO_USER_POOL_ID=<UserPoolId>
VITE_COGNITO_CLIENT_ID=<UserPoolClientId>
VITE_AWS_REGION=us-east-1
pnpm --filter client build
pnpm --filter infra exec cdk deploy ShareSocialMediaWeb
```

## CI / CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | PR / push to `main` | lint, typecheck, test, build, `cdk synth` |
| [`.github/workflows/cd.yml`](../.github/workflows/cd.yml) | `workflow_dispatch` or push to `main` (path-filtered) | OIDC → deploy API → build client with `ApiUrl` + Cognito outputs → deploy Web |

CD uses the `production` GitHub Environment. Prefer confirming `workflow_dispatch` for the first production deploy.

CD order:

1. Ensure `client/dist` exists (placeholder `index.html` so CDK can synth `ShareSocialMediaWeb` while deploying Api first)
2. Deploy `ShareSocialMediaApi`
3. Resolve `VITE_APP_BASE_URL` from `vars.VITE_APP_BASE_URL` or CloudFormation output `ApiUrl`
4. Resolve `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_AWS_REGION` from GitHub vars or CloudFormation outputs `UserPoolId` / `UserPoolClientId`
5. Build the Vite client with those env vars (replaces the placeholder)
6. Deploy `ShareSocialMediaWeb` (or the stacks requested via `workflow_dispatch`)

Manual client rebuild with a hard-coded URL is only needed for local/prod experiments outside CD.

## Cost notes

- HTTP API + Lambda: pay per request; free tier often covers light demos.
- S3 + CloudFront: pennies for low traffic; S3 buckets use `DESTROY` + `autoDeleteObjects` for non-prod teardown.
- Secrets Manager: ~$0.40/secret/month.
- DynamoDB on-demand: free tier / pay-per-request for light demos.
- S3 media + site storage: pay per GB / request (pennies at demo scale).

## Teardown

```bash
cd infra
pnpm exec cdk destroy --all
```

Empty/auto-delete is configured on the site bucket; confirm CloudFront and API resources are gone in the console if destroy fails mid-way.
