import { GetCommand } from '@aws-sdk/lib-dynamodb';
import request from 'supertest';
import { getDocClient } from '../db/client.js';
import { cognitoPk, SK, TABLE_NAME, userPk } from '../db/keys.js';
import { DynamoUserRepository } from '../modules/identity/index.js';
import { User } from '../modules/identity/domain/user.js';
import {
  DynamoFriendListRepository,
  getUserFriendsService,
  toggleFriendship,
} from '../modules/social/index.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

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

  test('toggleFriendship persists both peer friend lists', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const actor = await registerUser({ firstName: 'Actor' });
    const peer = await registerUser({ firstName: 'Friend' });
    const friendListRepo = new DynamoFriendListRepository();
    const userRepo = new DynamoUserRepository();

    await toggleFriendship(friendListRepo, actor.userId, peer.userId);

    const actorAfter = await userRepo.findById(actor.userId);
    const peerAfter = await userRepo.findById(peer.userId);
    expect(actorAfter!.toSnapshot().friends).toContain(peer.userId);
    expect(peerAfter!.toSnapshot().friends).toContain(actor.userId);

    // DB oracle: both USER items
    const doc = getDocClient();
    const actorItem = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(actor.userId), SK: SK.PROFILE },
      }),
    );
    const peerItem = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(peer.userId), SK: SK.PROFILE },
      }),
    );
    expect(
      (actorItem.Item as { friends?: string[] })?.friends,
    ).toContain(peer.userId);
    expect(
      (peerItem.Item as { friends?: string[] })?.friends,
    ).toContain(actor.userId);

    // Facade read-back (hydrated friends list for actor)
    const friends = await getUserFriendsService(actor.userId);
    expect(
      friends.some(
        (f: { _id?: string } | null) =>
          f != null && String(f._id) === peer.userId,
      ),
    ).toBe(true);
  });

  test('PATCH /users/:id/:friendId → both lists + GET friends consistent', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const actor = await registerUser({ firstName: 'HttpActor' });
    const peer = await registerUser({ firstName: 'HttpPeer' });

    const toggled = await request(app)
      .patch(`/users/${actor.userId}/${peer.userId}`)
      .set(authHeader(actor.token));

    expect(toggled.status).toBe(200);
    expect(
      toggled.body.some(
        (f: { _id?: string }) => String(f._id) === peer.userId,
      ),
    ).toBe(true);

    const doc = getDocClient();
    const actorItem = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(actor.userId), SK: SK.PROFILE },
      }),
    );
    const peerItem = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(peer.userId), SK: SK.PROFILE },
      }),
    );
    expect(
      (actorItem.Item as { friends?: string[] })?.friends,
    ).toContain(peer.userId);
    expect(
      (peerItem.Item as { friends?: string[] })?.friends,
    ).toContain(actor.userId);

    const friends = await request(app).get(`/users/${actor.userId}/friends`);
    expect(friends.status).toBe(200);
    expect(
      friends.body.some(
        (f: { _id?: string }) => String(f._id) === peer.userId,
      ),
    ).toBe(true);

    const profile = await request(app).get(`/users/${actor.userId}`);
    expect(profile.status).toBe(200);
    expect(profile.body.friends).toContain(peer.userId);
  });
});
