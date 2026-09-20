import { DEFAULT_IMAGE_ID } from '../../../../constants/constants.js';
import type { MediaFileRepository } from '../ports/media-file-repository.js';
import type { MediaFile } from '../../domain/media-file.js';
import { createMediaFile } from './create-media-file.js';

/**
 * Ensures the default image row exists. Returns null when already present
 * (mirrors legacy createDefaultService).
 */
export async function createDefaultMediaFile(
  repo: MediaFileRepository,
): Promise<MediaFile | null> {
  const existing = await repo.findById(DEFAULT_IMAGE_ID);
  if (existing) {
    return null;
  }
  return createMediaFile(repo, { id: DEFAULT_IMAGE_ID });
}
