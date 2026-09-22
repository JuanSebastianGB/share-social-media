# Deployment guide

Low-cost serverless target for share-social-media.

## Architecture

- **API**: API Gateway HTTP API → Lambda (Node 20) running Express via `@codegenie/serverless-express`
- **Web**: S3 (private) + CloudFront (OAC) serving the Vite `client/dist` build
- **Database**: DynamoDB single-table (`ShareSocialMedia`), on-demand billing
- **Media**: S3 bucket (private) + CloudFront (OAC) for `uploads/*`
- **Secrets**: the API stack does not create a Secrets Manager secret. Deployed Lambda does not read `JWT_SECRET` or `PUBLIC_URL` (those stay local-only for HS256 when Cognito env is unset)
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

   The role may assume CDK bootstrap roles (`cdk-hnb659fds-*`), call `DescribeStacks` on `ShareSocialMediaApi` and `ShareSocialMediaWeb`, sync S3 objects in this account, create CloudFront invalidations, and read bootstrap SSM parameters. Trust is limited to this repository (`main` + `production` / `Production` environments). Redeploy `ShareSocialMediaGithubOidc` once before the new CD publish can succeed. This template always creates the GitHub OIDC provider (one per account). Deploy this stack once; deploy fails if `token.actions.githubusercontent.com` already exists.

4. In the GitHub repo, configure (set via `gh secret set` / `gh variable set` — **never commit values**):
   - **Secret** `AWS_ROLE_ARN` — output `RoleArn` from `ShareSocialMediaGithubOidc`
   - **Secret** `AWS_ACCOUNT_ID` — 12-digit account id
   - **Variable** `AWS_REGION` — e.g. `us-east-1`
   - Optional **Variable** `VITE_APP_BASE_URL` — override API URL for the client build (otherwise CD reads stack output `ApiUrl` after deploying `ShareSocialMediaApi`)
   - Optional **Variable** `VITE_APP_DEFAULT_IMAGE_ID` — default avatar/storage id baked into the client build
   - Optional **Variable** `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_AWS_REGION` — override Cognito SPA env (otherwise CD reads `UserPoolId` / `UserPoolClientId` from the Api stack and uses `vars.AWS_REGION`)

### Leaving Vercel

Production hosting is **S3 + CloudFront** (`ShareSocialMediaWeb`), deployed by CD. `vercel.json` disables Vercel Git deployments for this repo. Also disconnect the project in the Vercel dashboard (Git integration / remove project) so preview status checks stop. Do not store AWS or app secrets in Vercel.

## Application secrets

Deployed Lambda does not read `JWT_SECRET` or `PUBLIC_URL`. Those stay local-only for HS256 when Cognito env is unset. The API stack does not create a Secrets Manager secret. There is no `APP_SECRET_ARN` and no `AppSecretArn` output.

CDK injects `TABLE_NAME`, `MEDIA_BUCKET`, `MEDIA_BASE_URL`, `COGNITO_USER_POOL_ID`, and `COGNITO_CLIENT_ID` as Lambda environment variables. `AWS_REGION` is set by Lambda itself.

CDK's old secret used RemovalPolicy RETAIN by default. After this deploy, CloudFormation drops it from the stack and leaves the secret in the account. Delete that leftover secret in the console if you do not want the monthly charge.

## Deploy manually

Web stack synth/deploy does not read `client/dist`. Build the client with `VITE_*` set, deploy the stacks, then `aws s3 sync` the dist to the `BucketName` output and invalidate `DistributionId`.

```bash
pnpm install
pnpm --filter server build
cd infra
export CDK_DEFAULT_ACCOUNT=...
export CDK_DEFAULT_REGION=us-east-1
pnpm exec cdk diff
pnpm exec cdk deploy --all
BUCKET=$(aws cloudformation describe-stacks --stack-name ShareSocialMediaWeb --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name ShareSocialMediaWeb --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
cd ..
# Set VITE_APP_BASE_URL, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, and VITE_AWS_REGION from the stack outputs first.
pnpm --filter client build
aws s3 sync client/dist "s3://${BUCKET}" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

Stack outputs:

- `ApiUrl` — HTTP API endpoint (CD wires this into the client build; set `vars.VITE_APP_BASE_URL` to override)
- `UserPoolId` / `UserPoolClientId` — Cognito ids (CD wires `VITE_COGNITO_*`; override with GitHub vars if needed)
- `MediaBaseUrl` / `MediaDistributionDomainName` — CloudFront URL prefix for uploaded media (`MEDIA_BASE_URL`)
- `DistributionDomainName` — CloudFront domain for the SPA
- `DistributionId` — CloudFront distribution ID (cache invalidation)
- `BucketName` — private S3 bucket for the static site (`aws s3 sync` target)

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
BUCKET=$(aws cloudformation describe-stacks --stack-name ShareSocialMediaWeb --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name ShareSocialMediaWeb --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
aws s3 sync client/dist "s3://${BUCKET}" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

## CI / CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | PR / push to `main` | lint, typecheck, test, build, `cdk synth` |
| [`.github/workflows/cd.yml`](../.github/workflows/cd.yml) | `workflow_dispatch` or push to `main` (path-filtered) | OIDC → deploy API → build client with `ApiUrl` + Cognito outputs → deploy Web → sync + invalidate |

CD uses the `production` GitHub Environment. Prefer confirming `workflow_dispatch` for the first production deploy.

CD order:

1. Deploy `ShareSocialMediaApi` (no extra CDK context)
2. Resolve `VITE_APP_BASE_URL` from `vars.VITE_APP_BASE_URL` or CloudFormation output `ApiUrl`
3. Resolve `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_AWS_REGION` from GitHub vars or CloudFormation outputs `UserPoolId` / `UserPoolClientId`
4. Build the Vite client with those env vars
5. Deploy `ShareSocialMediaWeb` when the request is the default / `--all`; otherwise `cdk deploy` the `stacks` input
6. When that deploy includes `ShareSocialMediaWeb`, read `BucketName` and `DistributionId`, `aws s3 sync client/dist` with `--delete`, and invalidate `/*`

Manual client rebuild with a hard-coded URL is only needed for local/prod experiments outside CD.

## Cost notes

- HTTP API + Lambda: pay per request; free tier often covers light demos.
- S3 + CloudFront: pennies for low traffic; S3 buckets use `DESTROY` + `autoDeleteObjects` for non-prod teardown.
- The API stack no longer creates a Secrets Manager secret. CDK's old secret used RemovalPolicy RETAIN by default. After this deploy, CloudFormation drops it from the stack and leaves the secret in the account. Delete that leftover secret in the console if you do not want the monthly charge.
- DynamoDB on-demand: free tier / pay-per-request for light demos.
- S3 media + site storage: pay per GB / request (pennies at demo scale).

## Teardown

```bash
cd infra
pnpm exec cdk destroy --all
```

Empty/auto-delete is configured on the site bucket; confirm CloudFront and API resources are gone in the console if destroy fails mid-way.
