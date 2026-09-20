import { GetCommand } from '@aws-sdk/lib-dynamodb';
import request from 'supertest';
import { getDocClient } from '../db/client.js';
import { commentPk, postPk, SK, TABLE_NAME } from '../db/keys.js';
import {
  createCommentService,
  getCommentService,
  DynamoCommentRepository,
} from '../modules/comments/index.js';
import { Comment } from '../modules/comments/domain/comment.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Comments integration (DynamoDB Local)', () => {
  test('persist Comment via DynamoCommentRepository and read back by id', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const author = await registerUser({ firstName: 'Commenter' });
    const repo = new DynamoCommentRepository();
    const comment = Comment.create({
      id: `cmt-repo-${Date.now()}`,
      description: 'persisted via repository',
      authorId: author.userId,
      firstName: author.firstName,
      lastName: author.lastName,
    });

    await repo.save(comment);

    const found = await repo.findById(comment.toSnapshot().id);
    expect(found).not.toBeNull();
    expect(found!.toSnapshot()).toEqual(
      expect.objectContaining({
        id: comment.toSnapshot().id,
        description: 'persisted via repository',
        authorId: author.userId,
        firstName: author.firstName,
        lastName: author.lastName,
      }),
    );

    // DB oracle: COMMENT item shape
    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: commentPk(comment.toSnapshot().id), SK: SK.META },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'COMMENT',
        _id: comment.toSnapshot().id,
        description: 'persisted via repository',
        userId: author.userId,
      }),
    );

    // Service facade read-back
    const viaService = await getCommentService(comment.toSnapshot().id);
    expect(viaService).toEqual(
      expect.objectContaining({
        _id: comment.toSnapshot().id,
        description: 'persisted via repository',
        userId: author.userId,
      }),
    );
  });

  test('createCommentService persists and getCommentService reads back', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const author = await registerUser({ firstName: 'ServiceAuthor' });
    const created = await createCommentService({
      description: 'via createCommentService',
      userId: author.userId,
      firstName: author.firstName,
      lastName: author.lastName,
    });

    expect(created._id).toEqual(expect.any(String));
    expect(created.description).toBe('via createCommentService');

    const fetched = await getCommentService(String(created._id));
    expect(fetched).toEqual(
      expect.objectContaining({
        _id: created._id,
        description: 'via createCommentService',
        userId: author.userId,
      }),
    );
  });

  test('POST /comments create-on-post → DB + list/get consistent', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const author = await registerUser({ firstName: 'PostAuthor' });
    const commenter = await registerUser({ firstName: 'HttpCommenter' });

    // Seed a post to attach comments to
    const createdPost = await request(app)
      .post('/posts')
      .set(authHeader(author.token))
      .send({ body: 'post for comment integration', type: 'text' });

    expect(createdPost.status).toBe(200);
    const postId = String(createdPost.body._id);

    // HTTP oracle: create comment (returns hydrated post)
    const created = await request(app)
      .post('/comments')
      .set(authHeader(commenter.token))
      .send({
        postId,
        firstName: commenter.firstName,
        lastName: commenter.lastName,
        description: 'integration comment',
      });

    expect(created.status).toBe(200);
    expect(created.body).toEqual(
      expect.objectContaining({
        _id: postId,
        comments: expect.any(Array),
      }),
    );
    // Hydrated post keeps comment ids (not comment documents)
    expect(created.body.comments.length).toBeGreaterThanOrEqual(1);
    const commentId = String(
      created.body.comments[created.body.comments.length - 1],
    );

    // DB oracle: COMMENT item
    const doc = getDocClient();
    const storedComment = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: commentPk(commentId), SK: SK.META },
      }),
    );
    expect(storedComment.Item).toEqual(
      expect.objectContaining({
        entityType: 'COMMENT',
        _id: commentId,
        description: 'integration comment',
        userId: commenter.userId,
      }),
    );

    // DB oracle: Post.comments includes comment id
    const storedPost = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: postPk(postId), SK: SK.META },
      }),
    );
    expect(
      (storedPost.Item as { comments?: string[] })?.comments,
    ).toContain(commentId);

    // HTTP oracle: GET /comments/:id
    const fetched = await request(app).get(`/comments/${commentId}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(
      expect.objectContaining({
        _id: commentId,
        description: 'integration comment',
        userId: commenter.userId,
      }),
    );

    // HTTP oracle: list includes comment
    const listed = await request(app).get('/comments');
    expect(listed.status).toBe(200);
    expect(
      listed.body.some((c: { _id?: string }) => String(c._id) === commentId),
    ).toBe(true);

    // HTTP oracle: post comments endpoint (hydrated comment docs)
    const postComments = await request(app).get(`/posts/${postId}/comments`);
    expect(postComments.status).toBe(200);
    expect(
      postComments.body.some(
        (c: { _id?: string; description?: string }) =>
          String(c._id) === commentId &&
          c.description === 'integration comment',
      ),
    ).toBe(true);
  });
});
