import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { getDocClient, resetDocClient } from '../db/client.js';
import { TABLE_NAME } from '../db/keys.js';

type DynamoCache = {
  ready: boolean;
  promise: Promise<void> | null;
};

declare global {
  var dynamoCache: DynamoCache | undefined;
}

const cached: DynamoCache = global.dynamoCache ?? {
  ready: false,
  promise: null,
};

global.dynamoCache = cached;

function isLocalEndpoint(): boolean {
  const endpoint = process.env.DYNAMODB_ENDPOINT;
  return Boolean(endpoint && endpoint !== 'memory');
}

function isMemory(): boolean {
  return process.env.DYNAMODB_ENDPOINT === 'memory';
}

async function ensureLocalTable(): Promise<void> {
  const endpoint = process.env.DYNAMODB_ENDPOINT!;
  const client = new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
    },
  });

  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return;
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) {
      throw err;
    }
  }

  try {
    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
          { AttributeName: 'GSI2PK', AttributeType: 'S' },
          { AttributeName: 'GSI2SK', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      }),
    );
  } catch (err) {
    if (!(err instanceof ResourceInUseException)) {
      throw err;
    }
  }
}

/**
 * Ensures DynamoDB is ready. Local endpoint: CreateTable if missing.
 * Memory adapter: no-op. AWS: validate TABLE_NAME env only.
 */
export async function connectToDatabase(): Promise<void> {
  if (cached.ready) return;

  if (!cached.promise) {
    cached.promise = (async () => {
      getDocClient();

      if (isMemory()) {
        cached.ready = true;
        console.log('**** Connected to DynamoDB (memory) ****');
        return;
      }

      if (isLocalEndpoint()) {
        await ensureLocalTable();
        cached.ready = true;
        console.log(`**** Connected to DynamoDB local (${TABLE_NAME}) ****`);
        return;
      }

      if (!process.env.TABLE_NAME && !TABLE_NAME) {
        throw new Error('TABLE_NAME env is required on AWS');
      }

      cached.ready = true;
      console.log(`**** DynamoDB ready (table=${TABLE_NAME}) ****`);
    })();
  }

  await cached.promise;
}

/** Local-dev convenience: fire-and-forget connect. */
const dbConnection = (): void => {
  connectToDatabase().catch((err) => {
    console.log('**** Error connecting to DynamoDB ****', err);
  });
};

export function resetDynamoConnection(): void {
  cached.ready = false;
  cached.promise = null;
  resetDocClient();
}

export default dbConnection;
