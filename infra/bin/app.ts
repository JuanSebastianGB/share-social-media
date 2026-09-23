#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack.js';
import { CIRoleStack } from '../lib/ci-role-stack.js';
import { WebStack } from '../lib/web-stack.js';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

new ApiStack(app, 'ShareSocialMediaApi', {
  env,
  description: 'HTTP API + Lambda for share-social-media',
});

const webStack = new WebStack(app, 'ShareSocialMediaWeb', {
  env,
  description: 'S3 + CloudFront static site for share-social-media',
});

new CIRoleStack(app, 'ShareSocialMediaCiRole', {
  env,
  description: 'OIDC role + policy for GitHub Actions CD (publish + invalidate)',
  siteBucket: webStack.siteBucket,
  siteDistribution: webStack.siteDistribution,
  githubRepo: 'JuanSebastianGB/share-social-media',
});

app.synth();
