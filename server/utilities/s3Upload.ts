import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export type UploadedImage = {
  secure_url: string;
  public_id?: string;
  key?: string;
};

function isMemoryMedia(): boolean {
  return (
    process.env.MEDIA_ENDPOINT === 'memory' ||
    process.env.DYNAMODB_ENDPOINT === 'memory'
  );
}

function getS3Client(): S3Client {
  const endpoint = process.env.MEDIA_ENDPOINT || process.env.AWS_ENDPOINT_URL;
  if (endpoint && endpoint !== 'memory') {
    return new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
      },
    });
  }
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

function publicObjectUrl(key: string): string {
  const base = process.env.MEDIA_BASE_URL?.replace(/\/$/, '');
  if (base) return `${base}/${key}`;
  const bucket = process.env.MEDIA_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function putUpload(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<UploadedImage> {
  if (isMemoryMedia() || !process.env.MEDIA_BUCKET) {
    const key = `uploads/memory-${randomUUID()}-${originalName}`;
    return {
      secure_url: `https://media.local/${key}`,
      public_id: key,
      key,
    };
  }

  const ext = originalName.includes('.')
    ? originalName.slice(originalName.lastIndexOf('.'))
    : '';
  const key = `uploads/${randomUUID()}${ext}`;
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.MEDIA_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
    }),
  );

  return {
    secure_url: publicObjectUrl(key),
    public_id: key,
    key,
  };
}

export async function deleteMediaObject(keyOrUrl?: string): Promise<void> {
  if (!keyOrUrl || isMemoryMedia() || !process.env.MEDIA_BUCKET) return;

  let key = keyOrUrl;
  if (keyOrUrl.startsWith('http')) {
    try {
      const pathname = new URL(keyOrUrl).pathname.replace(/^\//, '');
      key = pathname;
    } catch {
      return;
    }
  }

  if (!key.startsWith('uploads/')) return;

  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.MEDIA_BUCKET,
      Key: key,
    }),
  );
}

const s3Upload = {
  async uploadToS3(req: Request, _res: Response, next: NextFunction) {
    if (!req.file) return next();

    try {
      const buffer = req.file.buffer;
      if (!buffer) return next();

      const image = await putUpload(
        buffer,
        req.file.mimetype,
        req.file.originalname || 'upload.bin',
      );
      req.image = image;
      return next();
    } catch (error) {
      return next(error as Error);
    }
  },
};

export default s3Upload;
