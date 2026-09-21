# share-social-media infrastructure (AWS CDK)

TypeScript CDK app with two stacks:

| Stack | Resources |
| --- | --- |
| `ShareSocialMediaApi` | HTTP API + Lambda (Node 20) + DynamoDB + **media S3/CloudFront** + Cognito User Pool + Secrets Manager |
| `ShareSocialMediaWeb` | S3 site bucket + CloudFront + BucketDeployment |
| `ShareSocialMediaGithubOidc` | CloudFormation (`github-oidc.yaml`) — GitHub Actions OIDC provider + least-privilege CD role |

## Prerequisites

1. **Bootstrap** the target account/region once:

   ```bash
   npx cdk bootstrap aws://$ACCOUNT/$REGION
   ```

2. **Build the client** before WebStack deploy/synth (BucketDeployment reads `../client/dist`):

   ```bash
   pnpm --filter client build
   ```

3. Node 20+, pnpm, AWS credentials with deploy rights.

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

Placeholder secret JSON keys:

- `JWT_SECRET`
- `PUBLIC_URL`

Optional existing secret: `-c appSecretArn=arn:aws:secretsmanager:...`

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

Set GitHub secret `AWS_ROLE_ARN` to stack output `RoleArn` (do not commit). See [`docs/deployment.md`](../docs/deployment.md).

## Deploy

```bash
pnpm --filter client build
cd infra
pnpm exec cdk deploy --all
```

Outputs: `ApiUrl`, `MediaBucketName`, `MediaDistributionDomainName`, `MediaBaseUrl`, `UserPoolId`, `UserPoolClientId`, `DistributionDomainName`, `BucketName`, `AppSecretArn`.
