import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';
import { DEFAULT_IMAGE_ID } from '../../constants/constants.js';
import {
  connectToDatabase,
  resetDynamoConnection,
} from '../../database/dynamo.js';
import { resetDocClient } from '../../db/client.js';
import {
  createStorage,
  getStorageById,
} from '../../repositories/storage.js';

export type DynamoLocalHandle = {
  container: StartedTestContainer;
  endpoint: string;
};

let skipReason: string | undefined;
let handle: DynamoLocalHandle | undefined;

export function getIntegrationSkipReason(): string | undefined {
  return skipReason;
}

export function getDynamoLocalHandle(): DynamoLocalHandle | undefined {
  return handle;
}

async function ensureDefaultStorage() {
  const file = await getStorageById(DEFAULT_IMAGE_ID);
  if (!file) {
    await createStorage({
      _id: DEFAULT_IMAGE_ID,
      fileName: 'default-stub',
      url: 'https://media.local/uploads/default.jpg',
    });
  }
}

/**
 * Starts DynamoDB Local via Testcontainers and wires process.env for the app.
 * On Docker failure, sets skip reason so suites can pending cleanly.
 */
export async function startDynamoLocal(): Promise<void> {
  if (handle) return;
  try {
    const container = await new GenericContainer('amazon/dynamodb-local:2.5.2')
      .withCommand([
        '-jar',
        'DynamoDBLocal.jar',
        '-inMemory',
        '-sharedDb',
      ])
      .withExposedPorts(8000)
      .withWaitStrategy(Wait.forListeningPorts())
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(8000);
    const endpoint = `http://${host}:${port}`;

    process.env.DYNAMODB_ENDPOINT = endpoint;
    resetDynamoConnection();
    resetDocClient();
    await connectToDatabase();
    await ensureDefaultStorage();

    handle = { container, endpoint };
  } catch (error) {
    skipReason = `Docker/DynamoDB Local unavailable: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.warn(skipReason);
  }
}

export async function stopDynamoLocal(): Promise<void> {
  if (handle) {
    await handle.container.stop();
    handle = undefined;
  }
  resetDynamoConnection();
  resetDocClient();
}
