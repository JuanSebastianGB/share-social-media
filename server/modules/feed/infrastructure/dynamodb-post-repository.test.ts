import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../../../db/client.js';
import { SK, TABLE_NAME } from '../../../db/keys.js';
import type { MemoryDocClient } from '../../../db/memoryClient.js';
import { Post } from '../domain/post.js';
import { DynamoPostRepository } from './dynamodb-post-repository.js';

describe('DynamoPostRepository feed index', () => {
  const repo = new DynamoPostRepository();

  beforeEach(() => {
    (getDocClient() as MemoryDocClient)._clear();
  });

  test('count is the GSI1 feed size, not a table scan of post meta', async () => {
    await repo.save(
      Post.create({
        id: '507f1f77bcf86cd799439011',
        body: 'on the feed',
        authorId: '507f1f77bcf86cd799439012',
        now: '2026-03-01T00:00:00.000Z',
      }),
    );
    await getDocClient().send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: 'POST#orphan',
          SK: SK.META,
          entityType: 'POST',
          _id: 'orphan',
          body: 'not on the feed',
        },
      }),
    );

    expect(await repo.count()).toBe(1);
  });

  test('queryFeedIds resumes after an opaque continuation', async () => {
    await repo.save(
      Post.create({
        id: '507f1f77bcf86cd799439001',
        body: 'old',
        authorId: '507f1f77bcf86cd799439012',
        now: '2026-01-01T00:00:00.000Z',
      }),
    );
    await repo.save(
      Post.create({
        id: '507f1f77bcf86cd799439002',
        body: 'new',
        authorId: '507f1f77bcf86cd799439012',
        now: '2026-03-01T00:00:00.000Z',
      }),
    );

    const first = await repo.queryFeedIds({ limit: 1 });
    const continuation = first.continuation;
    expect(first.ids).toEqual(['507f1f77bcf86cd799439002']);
    expect(typeof continuation).toBe('string');
    expect(continuation).not.toContain('GSI1');
    expect(continuation).not.toContain('PK');
    expect(continuation).not.toContain('SK');

    const second = await repo.queryFeedIds({ limit: 1, continuation });
    expect(second.ids).toEqual(['507f1f77bcf86cd799439001']);
  });
});
