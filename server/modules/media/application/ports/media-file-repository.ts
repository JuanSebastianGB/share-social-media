import type { MediaFile } from '../../domain/media-file.js';

/**
 * Persistence port for the MediaFile aggregate (Media BC).
 * Soft-delete is domain `softDelete` then `save` — no softDelete/update on the port.
 */
export interface MediaFileRepository {
  save(file: MediaFile): Promise<void>;
  /** Active (non-deleted) only — mirrors getStorageById. */
  findById(id: string): Promise<MediaFile | null>;
  /** Includes soft-deleted — mirrors getStorageByIdIncludingDeleted. */
  findByIdIncludingDeleted(id: string): Promise<MediaFile | null>;
  /** Non-deleted only; order not guaranteed (Scan). */
  list(): Promise<MediaFile[]>;
  /** Hard delete Dynamo row; return false if missing. */
  delete(id: string): Promise<boolean>;
}
