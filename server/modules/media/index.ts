/**
 * Media bounded context public facade.
 * Scaffolding only — use cases and adapters are wired as the strangler migration progresses.
 */
export { InvalidMediaFileError, DomainError } from './domain/errors.js';
export { MediaFile } from './domain/media-file.js';
export type {
  MediaFileSnapshot,
  CreateMediaFileInput,
} from './domain/media-file.js';
