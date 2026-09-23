import * as cdk from 'aws-cdk-lib';
import type { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * GitHub environment name required on the OIDC token.
 * Mirrors the `environment: production` block in `.github/workflows/cd.yml`.
 */
const REQUIRED_GITHUB_ENVIRONMENT = 'production';

export interface CIRoleStackProps extends cdk.StackProps {
  readonly siteBucket: IBucket;
  readonly siteDistribution: IDistribution;
  /**
   * GitHub repository allowed to assume the role via OIDC,
   * in the form `"owner/name"` (e.g. `"JuanSebastianGB/share-social-media"`).
   */
  readonly githubRepo: string;
}

/**
 * Stack that owns the OIDC role used by the GitHub Actions CD workflow.
 *
 * The role trusts GitHub's OIDC provider only for this repo and only on
 * the `production` environment, then grants the minimum permissions needed
 * to publish the static site (`s3 sync --delete`) and invalidate the
 * CloudFront distribution.
 *
 * Permissions are derived from the {@link siteBucket} and
 * {@link siteDistribution} references instead of being spelled out by
 * hand, so they survive resource renames and stay consistent with what
 * `WebStack` actually exposes.
 *
 * Bootstrap: this stack must be deployed **once** with local admin
 * credentials (chicken-and-egg with OIDC). After that, CI keeps it up
 * to date via `cdk deploy`.
 */
export class CIRoleStack extends cdk.Stack {
  public readonly role: cdk.aws_iam.Role;

  constructor(scope: Construct, id: string, props: CIRoleStackProps) {
    super(scope, id, props);

    const { siteBucket, siteDistribution, githubRepo } = props;

    const oidcProvider = new cdk.aws_iam.OpenIdConnectProvider(
      this,
      'GitHubOidcProvider',
      {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
      },
    );

    this.role = new cdk.aws_iam.Role(this, 'Role', {
      roleName: 'share-social-media-ci-role',
      description:
        'GitHub Actions OIDC role for share-social-media CD (publish + invalidate)',
      assumedBy: new cdk.aws_iam.FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringLike: {
            'token-actions.githubusercontent.com:sub': `repo:${githubRepo}:*`,
          },
          StringEquals: {
            'token-actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            'token-actions.githubusercontent.com:environment':
              REQUIRED_GITHUB_ENVIRONMENT,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    // s3 sync --delete: ListBucket + Read/Write/Delete on objects.
    siteBucket.grantReadWrite(this.role);

    // CloudFront cache invalidation, scoped to this distribution only.
    this.role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudfront:CreateInvalidation'],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${siteDistribution.distributionId}`,
        ],
      }),
    );

    new cdk.CfnOutput(this, 'RoleArn', {
      value: this.role.roleArn,
      description: 'IAM role ARN assumed by GitHub Actions OIDC (CD)',
      exportName: 'ShareSocialMediaCiRole-RoleArn',
    });
  }
}
