import type { MediaFileRepository } from '../ports/media-file-repository.js';
import type { MediaFile } from '../../domain/media-file.js';

export async function getMediaFile(
  repo: MediaFileRepository,
  id: string,
): Promise<MediaFile | null> {
  return repo.findById(id);
}
