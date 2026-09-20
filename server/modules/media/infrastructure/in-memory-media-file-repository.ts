import { MediaFile } from '../domain/media-file.js';
import type { MediaFileRepository } from '../application/ports/media-file-repository.js';

/**
 * In-memory MediaFileRepository for unit tests and local fakes.
 */
export class InMemoryMediaFileRepository implements MediaFileRepository {
  private readonly files = new Map<string, MediaFile>();

  async save(file: MediaFile): Promise<void> {
    const snapshot = file.toSnapshot();
    this.files.set(snapshot.id, MediaFile.reconstitute(snapshot));
  }

  async findById(id: string): Promise<MediaFile | null> {
    const file = this.files.get(id);
    if (!file) return null;
    const snapshot = file.toSnapshot();
    if (snapshot.deleted) return null;
    return MediaFile.reconstitute(snapshot);
  }

  async findByIdIncludingDeleted(id: string): Promise<MediaFile | null> {
    const file = this.files.get(id);
    return file ? MediaFile.reconstitute(file.toSnapshot()) : null;
  }

  /**
   * Non-deleted files only. Order is not guaranteed (mirrors legacy Scan).
   */
  async list(): Promise<MediaFile[]> {
    return [...this.files.values()]
      .map((file) => file.toSnapshot())
      .filter((snapshot) => !snapshot.deleted)
      .map((snapshot) => MediaFile.reconstitute(snapshot));
  }

  async delete(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  clear(): void {
    this.files.clear();
  }
}
