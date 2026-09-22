# share-social-media infrastructure (AWS CDK)

TypeScript CDK app with two stacks:

| Stack | Resources |
| --- | --- |
| `ShareSocialMediaApi` | HTTP API + Lambda (Node 20) + DynamoDB + **media S3/CloudFront** + Cognito User Pool |
| `ShareSocialMediaWeb` | Private S3 site bucket + CloudFront (OAC). Site files are synced outside the stack. |
| `ShareSocialMediaGithubOidc` | CloudFormation (`github-oidc.yaml`) — GitHub Actions OIDC provider + least-privilege CD role |

## Prerequisites

1. **Bootstrap** the target account/region once:

   ```bash
   npx cdk bootstrap aws://$ACCOUNT/$REGION
   ```

2. Node 20+, pnpm, AWS credentials with deploy rights.

## Install & synth

```bash
pnpm install
cd infra
CDK_DEFAULT_ACCOUNT=111111111111 CDK_DEFAULT_REGION=us-east-1 pnpm exec cdk synth
```

## DynamoDB

Table `ShareSocialMedia`: PK/SK, PAY_PER_REQUEST, GSI1 + GSI2, `DESTROY`.

Lambda env: `TABLE_NAME` (+ read/write IAM).

## Media (S3 + CloudFront)

ApiStack creates a private media bucket + CloudFront distribution (OAC):

- Objects under `uploads/*`
- Bucket blocks public access (no `AnyPrincipal` GetObject)
- CloudFront serves reads via Origin Access Control
- Lambda can Put / Delete / Read
- Env: `MEDIA_BUCKET`, `MEDIA_BASE_URL` (= `https://<MediaDistributionDomainName>`)

## Cognito

ApiStack creates a User Pool + public SPA app client (no Hosted UI domain):

- Sign-in: email alias; self sign-up enabled; email auto-verified (demo)
- Password policy: min length 8 (upper / lower / digit; symbols not required)
- App client: `generateSecret: false`; auth flows `USER_PASSWORD_AUTH` + `USER_SRP_AUTH`
- Lambda env: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` (`AWS_REGION` is set by Lambda)
- Outputs: `UserPoolId`, `UserPoolClientId`

Server verifies Cognito access tokens with `aws-jwt-verify` when `COGNITO_*` are set; the SPA signs up/in via `@aws-sdk/client-cognito-identity-provider` and completes the DynamoDB profile with `POST /auth/profile`. Leave Cognito env unset for local HS256. `JWT_SECRET` remains for local / dual-mode.

## Secrets

The API stack does not create a Secrets Manager secret. There is no `APP_SECRET_ARN` and no `AppSecretArn` output. Deployed Lambda does not read `JWT_SECRET` or `PUBLIC_URL`. Those stay local-only for HS256 when Cognito env is unset.

CDK's old secret used RemovalPolicy RETAIN by default. After this deploy, CloudFormation drops it from the stack and leaves the secret in the account. Delete that leftover secret in the console if you do not want the monthly charge.

## Static site

Web stack synth/deploy does not read `client/dist`. Build the client with `VITE_*` set, deploy the web stack, then sync the dist to the `BucketName` output and invalidate `DistributionId`:

```bash
pnpm --filter client build
cd infra
pnpm exec cdk deploy ShareSocialMediaWeb
BUCKET=$(aws cloudformation describe-stacks --stack-name ShareSocialMediaWeb --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name ShareSocialMediaWeb --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
aws s3 sync ../client/dist "s3://${BUCKET}" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

## CORS

HTTP API CORS allows origin `*` (tighten later).

## GitHub OIDC (CD)

One-time (admin credentials):

```bash
aws cloudformation deploy \
  --stack-name ShareSocialMediaGithubOidc \
  --template-file github-oidc.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubOrg=<org> GitHubRepo=share-social-media
```

Set GitHub secret `AWS_ROLE_ARN` to stack output `RoleArn` (do not commit). The role can assume CDK bootstrap roles, call `DescribeStacks` on `ShareSocialMediaApi` and `ShareSocialMediaWeb`, sync S3 objects in this account, and create CloudFront invalidations. Redeploy `ShareSocialMediaGithubOidc` once before the new CD publish can succeed. The provider is create-once; the stack fails if `token.actions.githubusercontent.com` already exists. See [`docs/deployment.md`](../docs/deployment.md).

## Deploy

CD order: deploy API, resolve `ApiUrl` + Cognito outputs, build client, deploy web stack, sync + invalidate. Synth does not need `client/dist`.

```bash
cd infra
pnpm exec cdk deploy --all
```

Outputs: `ApiUrl`, `MediaBucketName`, `MediaDistributionDomainName`, `MediaBaseUrl`, `UserPoolId`, `UserPoolClientId`, `DistributionDomainName`, `DistributionId`, `BucketName`.
