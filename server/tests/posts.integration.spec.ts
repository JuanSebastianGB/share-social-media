import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import request from 'supertest';
import { getDocClient } from '../db/client.js';
import { GSI, postPk, SK, TABLE_NAME } from '../db/keys.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Posts integration (DynamoDB Local)', () => {
  test('create → get → like → feed query → delete with HTTP and DB oracles', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const author = await registerUser({ firstName: 'Author' });
    const liker = await registerUser({ firstName: 'Liker' });

    // HTTP oracle: create
    const created = await request(app)
      .post('/posts')
      .set(authHeader(author.token))
      .send({ body: 'integration post', type: 'text' });

    expect(created.status).toBe(200);
    expect(created.body._id).toEqual(expect.any(String));
    expect(created.body.body).toBe('integration post');
    const postId = String(created.body._id);

    // DB oracle: item exists
    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: postPk(postId), SK: SK.META },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'POST',
        _id: postId,
        body: 'integration post',
        userId: author.userId,
      }),
    );

    // HTTP oracle: get
    const fetched = await request(app).get(`/posts/${postId}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body[0]._id).toBe(postId);

    // HTTP + DB oracle: like
    const liked = await request(app)
      .put(`/posts/${postId}`)
      .set(authHeader(liker.token));
    expect(liked.status).toBe(200);
    expect(liked.body.likes[liker.userId]).toBe(true);

    const afterLike = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: postPk(postId), SK: SK.META },
      }),
    );
    expect(
      (afterLike.Item as { likes?: Record<string, boolean> })?.likes?.[
        liker.userId
      ],
    ).toBe(true);

    // DB oracle: feed GSI contains post
    const feed = await doc.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': GSI.FEED },
      }),
    );
    const feedIds = (feed.Items || []).map((item) => String(item._id));
    expect(feedIds).toContain(postId);

    // HTTP + DB oracle: delete
    const deleted = await request(app)
      .delete(`/posts/${postId}`)
      .set(authHeader(author.token));
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });

    const afterDelete = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: postPk(postId), SK: SK.META },
      }),
    );
    expect(afterDelete.Item).toBeUndefined();
  });
});
