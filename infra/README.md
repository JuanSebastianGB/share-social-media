# share-social-media infrastructure (AWS CDK)

TypeScript CDK app with two stacks:

| Stack | Resources |
| --- | --- |
| `ShareSocialMediaApi` | HTTP API + Lambda (Node 20) + DynamoDB + **media S3** + Secrets Manager |
| `ShareSocialMediaWeb` | S3 site bucket + CloudFront + BucketDeployment |

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

## Secrets

Placeholder secret JSON keys:

- `JWT_SECRET`
- `PUBLIC_URL`

Optional existing secret: `-c appSecretArn=arn:aws:secretsmanager:...`

## CORS

HTTP API CORS allows origin `*` (tighten later).

## Deploy

```bash
pnpm --filter client build
cd infra
pnpm exec cdk deploy --all
```

Outputs: `ApiUrl`, `MediaBucketName`, `MediaDistributionDomainName`, `MediaBaseUrl`, `DistributionDomainName`, `BucketName`, `AppSecretArn`.
