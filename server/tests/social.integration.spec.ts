import { GetCommand } from '@aws-sdk/lib-dynamodb';
import request from 'supertest';
import { getDocClient } from '../db/client.js';
import { SK, TABLE_NAME, userPk } from '../db/keys.js';
import {
  DynamoFriendListRepository,
  FriendList,
  getUserFriendsService,
  toggleFriendship,
} from '../modules/social/index.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Social integration (DynamoDB Local)', () => {
  test('persist FriendList via DynamoFriendListRepository and read back by userId', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const actor = await registerUser({ firstName: 'ListOwner' });
    const peer = await registerUser({ firstName: 'ListedFriend' });
    const repo = new DynamoFriendListRepository();

    const existing = await repo.findByUserId(actor.userId);
    expect(existing).not.toBeNull();

    const list = FriendList.reconstitute({
      ...existing!.toSnapshot(),
      friends: [peer.userId],
    });
    await repo.save(list);

    const found = await repo.findByUserId(actor.userId);
    expect(found).not.toBeNull();
    expect(found!.toSnapshot().friends).toContain(peer.userId);

    // DB oracle: USER.friends field on PROFILE item
    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(actor.userId), SK: SK.PROFILE },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'USER',
        _id: actor.userId,
      }),
    );
    expect(
      (stored.Item as { friends?: string[] })?.friends,
    ).toContain(peer.userId);
  });

  test('toggleFriendship persists both peer friend lists', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const actor = await registerUser({ firstName: 'Actor' });
    const peer = await registerUser({ firstName: 'Friend' });
    const friendListRepo = new DynamoFriendListRepository();

    await toggleFriendship(friendListRepo, actor.userId, peer.userId);

    const actorAfter = await friendListRepo.findByUserId(actor.userId);
    const peerAfter = await friendListRepo.findByUserId(peer.userId);
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
