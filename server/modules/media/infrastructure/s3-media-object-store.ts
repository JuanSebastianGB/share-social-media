import { deleteMediaObject } from '../../../utilities/s3Upload.js';
import type { MediaObjectStore } from '../application/ports/media-object-store.js';

/**
 * S3 (and memory-env no-op) adapter wrapping legacy `deleteMediaObject`.
 */
export class S3MediaObjectStore implements MediaObjectStore {
  async deleteObject(keyOrUrl?: string): Promise<void> {
    await deleteMediaObject(keyOrUrl);
  }
}
