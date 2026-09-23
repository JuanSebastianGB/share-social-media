import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Matcher, Template } from 'aws-cdk-lib/assertions';
import { ApiStack } from '../lib/api-stack.js';
import { CIRoleStack } from '../lib/ci-role-stack.js';
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

// Shared app for the CIRoleStack + its WebStack dependency so cross-stack
// references resolve inside one CDK app (cross-app refs are rejected).
const ciApp = new cdk.App();
const ciWebStack = new WebStack(ciApp, 'ShareSocialMediaWeb', { env });
const ciTemplate = Template.fromStack(
  new CIRoleStack(ciApp, 'ShareSocialMediaCiRole', {
    env,
    siteBucket: ciWebStack.siteBucket,
    siteDistribution: ciWebStack.siteDistribution,
    githubRepo: 'JuanSebastianGB/share-social-media',
  }),
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

// CDK renders OpenIdConnectProvider as a custom resource (no native
// AWS::IAM::OIDCProvider) and provisions a Lambda-backed role for that
// custom resource, so the synthesized stack contains exactly one
// `Custom::AWSCDKOpenIdConnectProvider` and exactly one role that
// trusts GitHub via WebIdentity.
function findOidcProviderLogicalId(template: Template): string {
  const providers = template.findResources('Custom::AWSCDKOpenIdConnectProvider');
  const keys = Object.keys(providers);
  assert.equal(keys.length, 1, `expected exactly one OIDC custom resource, got ${keys.length}`);
  return keys[0] as string;
}

function findOidcRole(template: Template): { logicalId: string; resource: unknown } {
  const roles = template.findResources('AWS::IAM::Role');
  for (const [logicalId, resource] of Object.entries(roles)) {
    const trust = (resource as { Properties?: { AssumeRolePolicyDocument?: { Statement?: unknown[] | unknown } } })
      .Properties?.AssumeRolePolicyDocument?.Statement;
    const statements = Array.isArray(trust) ? trust : trust === undefined ? [] : [trust];
    if (statements.some((s) => (s as { Action?: unknown })?.Action === 'sts:AssumeRoleWithWebIdentity')) {
      return { logicalId, resource };
    }
  }
  assert.fail('expected exactly one role with AssumeRoleWithWebIdentity trust');
}

function findPolicyStatementMatching(
  template: Template,
  roleLogicalId: string,
  matcher: Matcher,
): unknown {
  const policies = template.findResources('AWS::IAM::Policy');
  const collected: unknown[] = [];
  for (const policy of Object.values(policies)) {
    const props = policy as {
      Properties?: { Roles?: unknown[]; PolicyDocument?: { Statement?: unknown[] | unknown } };
    };
    const roles = props.Properties?.Roles ?? [];
    const attached = roles.some((r) => {
      if (r && typeof r === 'object' && 'Ref' in (r as Record<string, unknown>)) {
        return (r as { Ref: string }).Ref === roleLogicalId;
      }
      return false;
    });
    if (!attached) continue;
    const statements = props.Properties?.PolicyDocument?.Statement;
    if (Array.isArray(statements)) {
      collected.push(...statements);
    } else if (statements !== undefined) {
      collected.push(statements);
    }
  }
  return collected.find((s) => matcher.test(s).isSuccess);
}

// (debug prints removed)

test('CIRoleStack creates one OIDC provider and one role', () => {
  // CDK uses a custom resource to provision the IAM OIDC provider (so the
  // stack creates one OIDC infra resource) plus exactly one role whose
  // trust policy is WebIdentity.
  ciTemplate.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 1);
  findOidcRole(ciTemplate);
});

test('CIRoleStack role trusts GitHub OIDC only for this repo on production environment', () => {
  const oidcLogicalId = findOidcProviderLogicalId(ciTemplate);
  const { resource: role } = findOidcRole(ciTemplate);
  const trustStatements = (role as { Properties: { AssumeRolePolicyDocument: { Statement: unknown[] | unknown } } })
    .Properties.AssumeRolePolicyDocument.Statement;
  const trust = Array.isArray(trustStatements) ? trustStatements[0] : trustStatements;
  assert.ok(trust, 'expected a trust policy statement');

  const result = Match.objectLike({
    Action: 'sts:AssumeRoleWithWebIdentity',
    Principal: Match.objectLike({
      Federated: { Ref: oidcLogicalId },
    }),
    Condition: Match.objectLike({
      StringLike: Match.objectLike({
        'token-actions.githubusercontent.com:sub': Match.stringLikeRegexp(
          '^repo:JuanSebastianGB/share-social-media:\\*$',
        ),
      }),
      StringEquals: Match.objectLike({
        'token-actions.githubusercontent.com:environment': 'production',
      }),
    }),
  }).test(trust);

  assert.ok(
    result.isSuccess,
    `expected trust policy restricted to repo + production; got ${JSON.stringify(trust)}`,
  );
});

test('CIRoleStack role is granted S3 sync + CreateInvalidation', () => {
  const { logicalId: oidcRoleLogicalId } = findOidcRole(ciTemplate);

  // Cross-stack references render bucket/distribution ARNs as
  // Fn::ImportValue + Fn::Join; we only assert the structural shape that
  // ties the policy back to the WebStack's bucket and distribution.
  const bucketObjectsArn = Match.objectLike({
    'Fn::Join': Match.arrayWith([
      '',
      Match.arrayWith([
        Match.objectLike({ 'Fn::ImportValue': Match.stringLikeRegexp('.*') }),
        '/*',
      ]),
    ]),
  });
  const bucketArn = Match.objectLike({
    'Fn::ImportValue': Match.stringLikeRegexp('.*SiteBucket.*'),
  });
  const distributionArn = Match.objectLike({
    'Fn::Join': Match.arrayWith([
      '',
      Match.arrayWith([
        Match.stringLikeRegexp('^arn:aws:cloudfront::111111111111:distribution/$'),
        Match.objectLike({
          'Fn::ImportValue': Match.stringLikeRegexp('.*Distribution.*'),
        }),
      ]),
    ]),
  });

  const s3Objects = findPolicyStatementMatching(
    ciTemplate,
    oidcRoleLogicalId,
    Match.objectLike({
      Action: Match.arrayWith([
        Match.stringLikeRegexp('s3:GetObject'),
        Match.stringLikeRegexp('s3:DeleteObject'),
        Match.stringLikeRegexp('s3:PutObject'),
      ]),
      Resource: Match.arrayWith([bucketObjectsArn]),
    }),
  );
  assert.ok(
    s3Objects,
    'expected a policy statement granting S3 object read/write/delete on the bucket',
  );

  const s3List = findPolicyStatementMatching(
    ciTemplate,
    oidcRoleLogicalId,
    Match.objectLike({
      Action: Match.arrayWith([Match.stringLikeRegexp('s3:List')]),
      Resource: Match.arrayWith([bucketArn]),
    }),
  );
  assert.ok(
    s3List,
    'expected a policy statement granting s3:ListBucket on the bucket',
  );

  const cfInvalidate = findPolicyStatementMatching(
    ciTemplate,
    oidcRoleLogicalId,
    Match.objectLike({
      Action: 'cloudfront:CreateInvalidation',
      Resource: distributionArn,
    }),
  );
  assert.ok(
    cfInvalidate,
    'expected a policy statement granting cloudfront:CreateInvalidation on the distribution',
  );
});

test('CIRoleStack exports RoleArn', () => {
  ciTemplate.hasOutput('RoleArn', {
    Value: Match.anyValue(),
    Export: { Name: 'ShareSocialMediaCiRole-RoleArn' },
  });
});
