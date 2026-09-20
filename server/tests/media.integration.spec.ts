import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { getDocClient } from '../db/client.js';
import { filePk, SK, TABLE_NAME } from '../db/keys.js';
import {
  createFileUploadedRegisterService,
  deleteHardFileService,
  DynamoMediaFileRepository,
  getFileService,
} from '../modules/media/index.js';
import { MediaFile } from '../modules/media/domain/media-file.js';
import { getIntegrationSkipReason } from './integration/dynamodb-local.js';

describe('Media integration (DynamoDB Local)', () => {
  test('persist MediaFile via DynamoMediaFileRepository and read back by id', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const repo = new DynamoMediaFileRepository();
    const fileId = `file-repo-${Date.now()}`;
    const file = MediaFile.create({
      id: fileId,
      fileName: 'integration.png',
      url: 'https://media.local/uploads/integration.png',
      now: '2026-03-01T00:00:00.000Z',
    });

    await repo.save(file);

    const found = await repo.findById(fileId);
    expect(found).not.toBeNull();
    expect(found!.toSnapshot()).toEqual(
      expect.objectContaining({
        id: fileId,
        fileName: 'integration.png',
        url: 'https://media.local/uploads/integration.png',
        deleted: false,
      }),
    );

    // DB oracle: FILE item shape
    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: filePk(fileId), SK: SK.META },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'FILE',
        _id: fileId,
        fileName: 'integration.png',
        url: 'https://media.local/uploads/integration.png',
        deleted: false,
      }),
    );

    // Service facade read-back
    const viaService = await getFileService(fileId);
    expect(viaService).toEqual(
      expect.objectContaining({
        _id: fileId,
        fileName: 'integration.png',
        filename: 'integration.png',
        url: 'https://media.local/uploads/integration.png',
      }),
    );
  });

  test('softDelete via domain+save hides from findById; includingDeleted returns it', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const repo = new DynamoMediaFileRepository();
    const fileId = `file-soft-${Date.now()}`;
    await repo.save(
      MediaFile.create({
        id: fileId,
        fileName: 'soft.png',
        url: 'https://media.local/uploads/soft.png',
      }),
    );

    const loaded = await repo.findById(fileId);
    expect(loaded).not.toBeNull();
    loaded!.softDelete();
    await repo.save(loaded!);

    expect(await repo.findById(fileId)).toBeNull();
    const including = await repo.findByIdIncludingDeleted(fileId);
    expect(including?.toSnapshot().deleted).toBe(true);
    expect(including?.toSnapshot().fileName).toBe('soft.png');

    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: filePk(fileId), SK: SK.META },
      }),
    );
    expect(stored.Item).toEqual(
      expect.objectContaining({
        entityType: 'FILE',
        _id: fileId,
        deleted: true,
      }),
    );
  });

  test('createFileUploadedRegisterService + deleteHardFileService removes FILE row', async () => {
    if (getIntegrationSkipReason()) {
      pending(getIntegrationSkipReason());
      return;
    }

    const created = await createFileUploadedRegisterService(
      'hard-delete.png',
      'https://media.local/uploads/hard-delete.png',
    );
    expect(created._id).toEqual(expect.any(String));
    const fileId = String(created._id);

    const before = await getFileService(fileId);
    expect(before).toEqual(
      expect.objectContaining({
        _id: fileId,
        fileName: 'hard-delete.png',
      }),
    );

    const result = await deleteHardFileService(fileId);
    expect(result).toEqual({ acknowledged: true, deletedCount: 1 });

    expect(await getFileService(fileId)).toBeNull();

    const repo = new DynamoMediaFileRepository();
    expect(await repo.findByIdIncludingDeleted(fileId)).toBeNull();

    const doc = getDocClient();
    const stored = await doc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: filePk(fileId), SK: SK.META },
      }),
    );
    expect(stored.Item).toBeUndefined();
  });
});
