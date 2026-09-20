import type { StorageRecord } from '../../../types/entities.js';
import type { MediaFileSnapshot } from '../domain/media-file.js';
import { DynamoMediaFileRepository } from '../infrastructure/dynamodb-media-file-repository.js';
import { S3MediaObjectStore } from '../infrastructure/s3-media-object-store.js';
import { createDefaultMediaFile as createDefaultMediaFileUseCase } from './use-cases/create-default-media-file.js';
import { createMediaFile as createMediaFileUseCase } from './use-cases/create-media-file.js';
import { getMediaFile as getMediaFileUseCase } from './use-cases/get-media-file.js';
import { hardDeleteMediaFile as hardDeleteMediaFileUseCase } from './use-cases/hard-delete-media-file.js';
import { listMediaFiles as listMediaFilesUseCase } from './use-cases/list-media-files.js';
import { softDeleteMediaFile as softDeleteMediaFileUseCase } from './use-cases/soft-delete-media-file.js';

const mediaFileRepository = new DynamoMediaFileRepository();
const mediaObjectStore = new S3MediaObjectStore();

/** Legacy HTTP shape for Storage / FILE documents. */
export function toLegacyStorageRecord(
  snapshot: MediaFileSnapshot,
): StorageRecord {
  return {
    _id: snapshot.id,
    fileName: snapshot.fileName,
    filename: snapshot.fileName,
    url: snapshot.url,
    deleted: snapshot.deleted,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export async function getFilesService() {
  const files = await listMediaFilesUseCase(mediaFileRepository);
  return files.map((file) => toLegacyStorageRecord(file.toSnapshot()));
}

export async function getFileService(id: string) {
  const file = await getMediaFileUseCase(mediaFileRepository, id);
  if (!file) return null;
  return toLegacyStorageRecord(file.toSnapshot());
}

export async function createFileUploadedRegisterService(
  filename: string,
  url?: string,
) {
  const file = await createMediaFileUseCase(mediaFileRepository, {
    fileName: filename,
    url,
  });
  return toLegacyStorageRecord(file.toSnapshot());
}

export async function deleteSoftFileService(id: string) {
  return softDeleteMediaFileUseCase(mediaFileRepository, id);
}

export async function deleteHardFileService(id: string | unknown) {
  return hardDeleteMediaFileUseCase(
    mediaFileRepository,
    mediaObjectStore,
    String(id),
  );
}

export async function createDefaultService() {
  const file = await createDefaultMediaFileUseCase(mediaFileRepository);
  if (!file) return null;
  return toLegacyStorageRecord(file.toSnapshot());
}
