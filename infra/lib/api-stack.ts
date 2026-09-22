import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient('SpaClient', {
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true,
    });

    const mediaBaseUrl = `https://${mediaDistribution.distributionDomainName}`;

    const environment: Record<string, string> = {
      TABLE_NAME: table.tableName,
      MEDIA_BUCKET: mediaBucket.bucketName,
      MEDIA_BASE_URL: mediaBaseUrl,
      // AWS_REGION is injected by Lambda; do not set (reserved).
      COGNITO_USER_POOL_ID: userPool.userPoolId,
      COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
    };

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

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'HTTP API endpoint URL',
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

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID (email sign-in; no Hosted UI)',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Public SPA Cognito app client ID (no client secret)',
    });
  }
}
