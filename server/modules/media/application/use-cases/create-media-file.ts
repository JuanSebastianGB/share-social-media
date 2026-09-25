import type { MediaFileRepository } from '../ports/media-file-repository.js';
import { MediaFile } from '../../domain/media-file.js';
import { generateId } from '../../../../db/ids.js';

export type CreateMediaFileCommand = {
  fileName?: string;
  url?: string;
  ownerId?: string;
  id?: string;
  now?: string;
};

export async function createMediaFile(
  repo: MediaFileRepository,
  command: CreateMediaFileCommand,
): Promise<MediaFile> {
  const file = MediaFile.create({
    id: command.id ?? generateId(),
    fileName: command.fileName,
    url: command.url,
    ownerId: command.ownerId,
    now: command.now,
  });
  await repo.save(file);
  return file;
}
