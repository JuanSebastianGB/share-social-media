/**
 * Object-store port for Media hard-delete side effects (S3 / memory).
 * Domain never calls this — application orchestration does.
 */
export interface MediaObjectStore {
  deleteObject(keyOrUrl?: string): Promise<void>;
}
