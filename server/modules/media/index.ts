/**
 * Media bounded context public facade.
 */
export { InvalidMediaFileError, DomainError } from './domain/errors.js';
export { MediaFile } from './domain/media-file.js';
export type {
  MediaFileSnapshot,
  CreateMediaFileInput,
} from './domain/media-file.js';
export type { MediaFileRepository } from './application/ports/media-file-repository.js';
export type { MediaObjectStore } from './application/ports/media-object-store.js';
export { DynamoMediaFileRepository } from './infrastructure/dynamodb-media-file-repository.js';
export { InMemoryMediaFileRepository } from './infrastructure/in-memory-media-file-repository.js';
export { InMemoryMediaObjectStore } from './infrastructure/in-memory-media-object-store.js';
export { S3MediaObjectStore } from './infrastructure/s3-media-object-store.js';
export {
  toLegacyStorageRecord,
  getFilesService,
  getFileService,
  createFileUploadedRegisterService,
  deleteSoftFileService,
  deleteHardFileService,
  createDefaultService,
} from './application/composition.js';
