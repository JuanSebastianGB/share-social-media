import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { GSI, SK, TABLE_NAME } from '../db/keys.js';
import type { MemoryDocClient } from '../db/memoryClient.js';

describe('memory Query', () => {
  const doc = () => getDocClient();

  beforeEach(() => {
    (doc() as MemoryDocClient)._clear();
  });

  async function putFeedPost(id: string, createdAt: string) {
    await doc().send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `POST#${id}`,
          SK: SK.META,
          _id: id,
          GSI1PK: GSI.FEED,
          GSI1SK: `POST#${createdAt}#${id}`,
        },
      }),
    );
  }

  test('GSI1 feed query returns newest GSI1SK first', async () => {
    await putFeedPost('older', '2026-01-01T00:00:00.000Z');
    await putFeedPost('newer', '2026-03-01T00:00:00.000Z');

    const result = await doc().send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': GSI.FEED },
        ScanIndexForward: false,
      }),
    );

    expect((result.Items ?? []).map((item) => item._id)).toEqual([
      'newer',
      'older',
    ]);
  });

  test('Limit resumes after ExclusiveStartKey', async () => {
    await putFeedPost('older', '2026-01-01T00:00:00.000Z');
    await putFeedPost('newer', '2026-03-01T00:00:00.000Z');

    const first = await doc().send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': GSI.FEED },
        ScanIndexForward: false,
        Limit: 1,
      }),
    );

    expect(first.Items?.[0]?._id).toBe('newer');
    expect(first.LastEvaluatedKey).toBeDefined();

    const second = await doc().send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': GSI.FEED },
        ScanIndexForward: false,
        Limit: 1,
        ExclusiveStartKey: first.LastEvaluatedKey,
      }),
    );

    expect(second.Items?.[0]?._id).toBe('older');
    expect(second.LastEvaluatedKey).toBeUndefined();
  });

  test('a missing ExclusiveStartKey yields no further items', async () => {
    await putFeedPost('only', '2026-01-01T00:00:00.000Z');

    const result = await doc().send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': GSI.FEED },
        ScanIndexForward: false,
        ExclusiveStartKey: {
          PK: 'POST#missing',
          SK: SK.META,
          GSI1PK: GSI.FEED,
          GSI1SK: 'POST#2026-06-01T00:00:00.000Z#missing',
        },
      }),
    );

    expect(result.Items ?? []).toEqual([]);
    expect(result.LastEvaluatedKey).toBeUndefined();
  });

  test('Select COUNT returns the partition size without items', async () => {
    await putFeedPost('older', '2026-01-01T00:00:00.000Z');
    await putFeedPost('newer', '2026-03-01T00:00:00.000Z');

    const result = await doc().send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': GSI.FEED },
        Select: 'COUNT',
      }),
    );

    expect(result.Count).toBe(2);
    expect(result.Items).toBeUndefined();
  });
});
