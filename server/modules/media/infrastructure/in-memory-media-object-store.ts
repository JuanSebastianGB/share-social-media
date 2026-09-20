import type { MediaObjectStore } from '../application/ports/media-object-store.js';

/**
 * No-op object store for tests and MEDIA_ENDPOINT=memory.
 */
export class InMemoryMediaObjectStore implements MediaObjectStore {
  readonly deletedKeys: string[] = [];

  async deleteObject(keyOrUrl?: string): Promise<void> {
    if (keyOrUrl) {
      this.deletedKeys.push(keyOrUrl);
    }
  }

  clear(): void {
    this.deletedKeys.length = 0;
  }
}
