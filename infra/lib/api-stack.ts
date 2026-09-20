import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ApiStackProps extends cdk.StackProps {
  /**
   * Optional ARN of an existing Secrets Manager secret.
   * JSON keys: JWT_SECRET, PUBLIC_URL.
   * When omitted, a placeholder secret is created (replace values after deploy).
   */
  appSecretArn?: string;
}

const SECRET_KEYS = ['JWT_SECRET', 'PUBLIC_URL'] as const;

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'ShareSocialMedia', {
      tableName: 'ShareSocialMedia',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // User/post media. Private bucket; public reads via CloudFront (OAC).
    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const mediaDistribution = new cloudfront.Distribution(
      this,
      'MediaDistribution',
      {
        comment: 'share-social-media uploaded media',
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(mediaBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
        },
      },
    );

    const appSecret = props?.appSecretArn
      ? secretsmanager.Secret.fromSecretCompleteArn(
          this,
          'AppSecret',
          props.appSecretArn,
        )
      : new secretsmanager.Secret(this, 'AppSecret', {
          description:
            'share-social-media app secrets (replace placeholder values)',
          secretObjectValue: {
            JWT_SECRET: cdk.SecretValue.unsafePlainText('REPLACE_ME_JWT_SECRET'),
            PUBLIC_URL: cdk.SecretValue.unsafePlainText(
              'https://REPLACE_ME.execute-api.us-east-1.amazonaws.com',
            ),
          },
        });

    const mediaBaseUrl = `https://${mediaDistribution.distributionDomainName}`;

    const environment: Record<string, string> = {
      TABLE_NAME: table.tableName,
      MEDIA_BUCKET: mediaBucket.bucketName,
      MEDIA_BASE_URL: mediaBaseUrl,
    };
    for (const key of SECRET_KEYS) {
      environment[key] = appSecret.secretValueFromJson(key).unsafeUnwrap();
    }

    const serverRoot = path.join(__dirname, '../../server');

    const apiFn = new NodejsFunction(this, 'ApiFunction', {
      entry: path.join(serverRoot, 'handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: cdk.Duration.seconds(29),
      environment,
      bundling: {
        minify: true,
        target: 'node20',
        forceDockerBundling: false,
      },
      projectRoot: path.join(__dirname, '../..'),
      depsLockFilePath: path.join(__dirname, '../../pnpm-lock.yaml'),
      description: 'Express API via @codegenie/serverless-express',
    });

    table.grantReadWriteData(apiFn);
    mediaBucket.grantPut(apiFn);
    mediaBucket.grantDelete(apiFn);
    mediaBucket.grantRead(apiFn);
    appSecret.grantRead(apiFn);

    const integration = new HttpLambdaIntegration('ApiIntegration', apiFn);

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'share-social-media-api',
      description: 'HTTP API for share-social-media',
      corsPreflight: {
        allowHeaders: [
          'Authorization',
          'Content-Type',
          'X-Requested-With',
          '*',
        ],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        maxAge: cdk.Duration.days(1),
      },
      defaultIntegration: integration,
    });

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration,
    });

    this.apiUrl = httpApi.apiEndpoint;

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'HTTP API endpoint URL',
    });

    new cdk.CfnOutput(this, 'AppSecretArn', {
      value: appSecret.secretArn,
      description:
        'Secrets Manager ARN — update JSON values before production use',
    });

    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
      description: 'S3 bucket for uploaded media (private; read via CloudFront)',
    });

    new cdk.CfnOutput(this, 'MediaDistributionDomainName', {
      value: mediaDistribution.distributionDomainName,
      description: 'CloudFront domain for uploaded media',
    });

    new cdk.CfnOutput(this, 'MediaBaseUrl', {
      value: mediaBaseUrl,
      description:
        'Public base URL for media objects under uploads/ (CloudFront)',
    });
  }
}
