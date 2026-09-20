import { InvalidMediaFileError } from './errors.js';

export type MediaFileSnapshot = {
  id: string;
  fileName?: string;
  url?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMediaFileInput = {
  id: string;
  fileName?: string;
  url?: string;
  /** Injected clock for deterministic tests. */
  now?: string;
};

/**
 * MediaFile aggregate root for the Media bounded context.
 * Soft-delete lives here; hard-delete / S3 I/O stay outside the domain.
 */
export class MediaFile {
  private constructor(private readonly props: MediaFileSnapshot) {}

  static create(input: CreateMediaFileInput): MediaFile {
    if (!input.id.trim()) {
      throw new InvalidMediaFileError('Media file id is required');
    }

    const now = input.now ?? new Date().toISOString();
    return new MediaFile({
      id: input.id,
      fileName: normalizeOptionalText(input.fileName),
      url: normalizeOptionalText(input.url),
      deleted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(snapshot: MediaFileSnapshot): MediaFile {
    return new MediaFile({ ...snapshot });
  }

  /**
   * Marks the file soft-deleted. Idempotent when already deleted
   * (mirrors legacy softDelete with deletedCount 0 — no throw).
   */
  softDelete(): void {
    if (this.props.deleted) {
      return;
    }
    this.props.deleted = true;
    this.touch();
  }

  toSnapshot(): MediaFileSnapshot {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
  }
}

function normalizeOptionalText(value?: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
