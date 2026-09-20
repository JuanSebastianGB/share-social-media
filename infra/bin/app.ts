#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack.js';
import { WebStack } from '../lib/web-stack.js';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const appSecretArn =
  (app.node.tryGetContext('appSecretArn') as string | undefined) ??
  process.env.appSecretArn;

new ApiStack(app, 'ShareSocialMediaApi', {
  env,
  appSecretArn,
  description: 'HTTP API + Lambda for share-social-media',
});

new WebStack(app, 'ShareSocialMediaWeb', {
  env,
  description: 'S3 + CloudFront static site for share-social-media',
});

app.synth();
