import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ApiStack } from '../lib/api-stack.js';
import { WebStack } from '../lib/web-stack.js';

const env = { account: '111111111111', region: 'us-east-1' };

const REQUIRED_LAMBDA_ENV = [
  'TABLE_NAME',
  'MEDIA_BUCKET',
  'MEDIA_BASE_URL',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
] as const;

const apiApp = new cdk.App();
const apiTemplate = Template.fromStack(
  new ApiStack(apiApp, 'ShareSocialMediaApi', { env }),
);
const webApp = new cdk.App();
const webTemplate = Template.fromStack(
  new WebStack(webApp, 'ShareSocialMediaWeb', { env }),
);

function apiLambdaEnvironment(
  template: Template,
): Record<string, unknown> {
  const functions = template.findResources('AWS::Lambda::Function');
  const apiFunction = Object.values(functions).find((resource) => {
    const variables = resource.Properties?.Environment?.Variables as
      | Record<string, unknown>
      | undefined;
    return variables !== undefined && Object.hasOwn(variables, 'TABLE_NAME');
  });
  assert.ok(apiFunction, 'expected an API Lambda with TABLE_NAME');
  return apiFunction.Properties.Environment.Variables as Record<
    string,
    unknown
  >;
}

test('ApiStack does not create a Secrets Manager secret', () => {
  apiTemplate.resourceCountIs('AWS::SecretsManager::Secret', 0);
});

test('ApiStack Lambda environment has Cognito and media keys only', () => {
  const variables = apiLambdaEnvironment(apiTemplate);

  assert.deepEqual(
    Object.keys(variables).sort(),
    [...REQUIRED_LAMBDA_ENV].sort(),
  );
});

test('ApiStack registers a single $default HTTP API route', () => {
  apiTemplate.resourceCountIs('AWS::ApiGatewayV2::Route', 1);
  const routes = apiTemplate.findResources('AWS::ApiGatewayV2::Route');
  const routeKeys = Object.values(routes).map(
    (route) => route.Properties?.RouteKey,
  );
  assert.deepEqual(routeKeys, ['$default']);
});

test('WebStack does not deploy the client bundle', () => {
  webTemplate.resourceCountIs('Custom::CDKBucketDeployment', 0);
  // autoDeleteObjects on the private bucket keeps one provider Lambda.
  // BucketDeployment is gone; that provider is not a site publisher.
  const functions = webTemplate.findResources('AWS::Lambda::Function');
  const logicalIds = Object.keys(functions);
  assert.equal(logicalIds.length, 1);
  assert.match(
    logicalIds[0] ?? '',
    /^CustomS3AutoDeleteObjectsCustomResourceProviderHandler/,
  );
});

test('WebStack publishes DistributionId', () => {
  webTemplate.hasOutput('DistributionId', { Value: Match.anyValue() });
});
