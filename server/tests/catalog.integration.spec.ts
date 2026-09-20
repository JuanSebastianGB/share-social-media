import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import request from 'supertest';
import { getDocClient } from '../db/client.js';
import { itemPk, SK, TABLE_NAME, userPk } from '../db/keys.js';
import {
  CatalogItem,
  createItemService,
  deleteItemService,
  DynamoCatalogItemRepository,
  getItemService,
  listItemsService,
  updateItemService,
} from '../modules/catalog/index.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';
import { app } from './testApp.js';
import { authHeader, loginUser, registerUser } from './helpers.js';

/**
 * Local-auth admin elevation for Items HTTP against DynamoDB Local.
 * Same pattern as items.characterization.test.ts.
 */
async function elevateToAdmin(user: {
  userId: string;
  email: string;
  password: string;
}): Promise<string> {
  await getDocClient().send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(user.userId), SK: SK.PROFILE },
      UpdateExpression: 'SET #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':role': ['admin'] },
    }),
  );
  const login = await loginUser(user.email, user.password);
  if (login.status !== 200 || !login.body.token) {
    throw new Error(
      `elevateToAdmin login failed: ${login.status} ${JSON.stringify(login.body)}`,
    );
  }
  return String(login.body.token);
}

describe('Catalog integration (DynamoDB Local)', () => {
  test('persist CatalogItem via DynamoCatalogItemRepository (save/find/list/delete)', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const repo = new DynamoCatalogItemRepository();
    const itemId = `item-repo-${Date.now()}`;
    const item = CatalogItem.create({
      id: itemId,
      name: 'RepoRoundTrip',
      active: true,
      now: '2026-03-01T00:00:00.000Z',
    });

    await repo.save(item);

    const found = await repo.findById(itemId);
    expect(found).not.toBeNull();
    expect(found!.toSnapshot()).toEqual(
      expect.objectContaining({
        id: itemId,
        name: 'RepoRoundTrip',
        active: true,
        createdAt: '2026-03-01T00:00:00.000Z',
      }),
    );

    const listed = await repo.list();
    expect(listed.some((i) => i.toSnapshot().id === itemId)).toBe(true);

    // DB oracle: ITEM# row
    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'ITEM',
        _id: itemId,
        name: 'RepoRoundTrip',
        active: true,
      }),
    );

    const deleted = await repo.delete(itemId);
    expect(deleted).toBe(true);
    expect(await repo.findById(itemId)).toBeNull();

    const afterDelete = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(afterDelete.Item).toBeUndefined();
  });

  test('composition services create/get/list/update/delete against Dynamo Local', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const created = await createItemService({
      name: 'ServiceItem',
      active: true,
    });
    expect(created._id).toEqual(expect.any(String));
    expect(created.name).toBe('ServiceItem');
    expect(created.active).toBe(true);
    const itemId = String(created._id);

    const fetched = await getItemService(itemId);
    expect(fetched).toEqual(
      expect.objectContaining({
        _id: itemId,
        name: 'ServiceItem',
        active: true,
      }),
    );

    const listed = await listItemsService();
    expect(listed.some((i) => i._id === itemId)).toBe(true);

    const updateResult = await updateItemService(itemId, {
      name: 'ServiceUpdated',
      active: false,
    });
    expect(updateResult).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });

    const afterUpdate = await getItemService(itemId);
    expect(afterUpdate).toEqual(
      expect.objectContaining({
        _id: itemId,
        name: 'ServiceUpdated',
        active: false,
      }),
    );

    // DB oracle after update
    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'ITEM',
        _id: itemId,
        name: 'ServiceUpdated',
        active: false,
      }),
    );

    const deleteResult = await deleteItemService(itemId);
    expect(deleteResult).toEqual({ acknowledged: true, deletedCount: 1 });
    expect(await getItemService(itemId)).toBeNull();

    const afterDelete = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(afterDelete.Item).toBeUndefined();
  });

  test('HTTP Items CRUD → ITEM# rows (public list, admin create, put, delete)', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const user = await registerUser({ firstName: 'CatalogHttp' });
    const adminToken = await elevateToAdmin(user);

    const listBefore = await request(app).get('/items');
    expect(listBefore.status).toBe(200);
    expect(Array.isArray(listBefore.body)).toBe(true);

    const created = await request(app)
      .post('/items')
      .set(authHeader(adminToken))
      .send({ name: 'HttpCatalog', active: true });

    expect(created.status).toBe(200);
    expect(created.body).toEqual({
      newItem: expect.objectContaining({
        _id: expect.any(String),
        name: 'HttpCatalog',
        active: true,
      }),
    });
    const itemId = String(created.body.newItem._id);

    const doc = getDocClient();
    const afterCreate = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(afterCreate.Item).toEqual(
      expect.objectContaining({
        entityType: 'ITEM',
        _id: itemId,
        name: 'HttpCatalog',
        active: true,
      }),
    );

    const got = await request(app)
      .get(`/items/${itemId}`)
      .set(authHeader(user.token));
    expect(got.status).toBe(200);
    expect(got.body).toEqual(
      expect.objectContaining({
        _id: itemId,
        name: 'HttpCatalog',
        active: true,
      }),
    );

    const updated = await request(app)
      .put(`/items/${itemId}`)
      .set(authHeader(user.token))
      .send({ name: 'HttpUpdated', active: false });
    expect(updated.status).toBe(200);
    expect(updated.body).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });

    const afterUpdate = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(afterUpdate.Item).toEqual(
      expect.objectContaining({
        entityType: 'ITEM',
        _id: itemId,
        name: 'HttpUpdated',
        active: false,
      }),
    );

    const deleted = await request(app)
      .delete(`/items/${itemId}`)
      .set(authHeader(user.token));
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });

    const afterDelete = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: itemPk(itemId), SK: SK.META },
      }),
    );
    expect(afterDelete.Item).toBeUndefined();
  });
});
