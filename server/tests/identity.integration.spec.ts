import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { cognitoPk, SK, TABLE_NAME, userPk } from '../db/keys.js';
import { DynamoUserRepository } from '../modules/identity/index.js';
import { User } from '../modules/identity/domain/user.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';

describe('Identity integration (DynamoDB Local)', () => {
  test('persist User via DynamoUserRepository and read by id/email/cognitoSub', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const repo = new DynamoUserRepository();
    const userId = `usr-repo-${Date.now()}`;
    const email = `repo${Date.now().toString(36)}@ex.co`;
    const cognitoSub = `sub-repo-${Date.now()}`;
    const user = User.create({
      id: userId,
      email,
      firstName: 'Repo',
      lastName: 'User',
      password: 'hashed',
      cognitoSub,
      friends: [],
    });

    await repo.save(user);

    const byId = await repo.findById(userId);
    expect(byId).not.toBeNull();
    expect(byId!.toSnapshot()).toEqual(
      expect.objectContaining({
        id: userId,
        email: email.toLowerCase(),
        firstName: 'Repo',
        lastName: 'User',
        cognitoSub,
      }),
    );

    const byEmail = await repo.findByEmail(email.toUpperCase());
    expect(byEmail).not.toBeNull();
    expect(byEmail!.toSnapshot().id).toBe(userId);

    const bySub = await repo.findByCognitoSub(cognitoSub);
    expect(bySub).not.toBeNull();
    expect(bySub!.toSnapshot().id).toBe(userId);

    // DB oracle: USER + COGNITO_LINK item shapes
    const doc = getDocClient();
    const storedUser = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(userId), SK: SK.PROFILE },
      }),
    );
    expect(storedUser.Item).toEqual(
      expect.objectContaining({
        entityType: 'USER',
        _id: userId,
        email: email.toLowerCase(),
        cognitoSub,
      }),
    );

    const storedLink = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: cognitoPk(cognitoSub), SK: SK.LINK },
      }),
    );
    expect(storedLink.Item).toEqual(
      expect.objectContaining({
        entityType: 'COGNITO_LINK',
        userId,
        cognitoSub,
      }),
    );
  });
});
