import type { MediaFileRepository } from '../ports/media-file-repository.js';
import type { MediaFile } from '../../domain/media-file.js';

export async function listMediaFiles(
  repo: MediaFileRepository,
): Promise<MediaFile[]> {
  return repo.list();
}
