import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createMemoryDocClient, type MemoryDocClient } from './memoryClient.js';

export type DocClient = DynamoDBDocumentClient | MemoryDocClient;

let cached: DocClient | undefined;

export function getDocClient(): DocClient {
  if (cached) return cached;

  const endpoint = process.env.DYNAMODB_ENDPOINT;

  if (endpoint === 'memory') {
    cached = createMemoryDocClient();
    return cached;
  }

  const client = new DynamoDBClient({
    ...(endpoint
      ? {
          endpoint,
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
          },
        }
      : {
          region: process.env.AWS_REGION || 'us-east-1',
        }),
  });

  cached = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });

  return cached;
}

/** Reset cached client (tests). */
export function resetDocClient(): void {
  cached = undefined;
}
