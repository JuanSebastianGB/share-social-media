import { DEFAULT_IMAGE_ID } from '../constants/constants.js';
import { connectToDatabase, resetDynamoConnection } from '../database/dynamo.js';
import { getDocClient, resetDocClient } from '../db/client.js';
import type { MemoryDocClient } from '../db/memoryClient.js';
import {
  createStorage,
  getStorageById,
} from '../repositories/storage.js';

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

beforeAll(async () => {
  process.env.DYNAMODB_ENDPOINT = 'memory';
  process.env.TABLE_NAME = process.env.TABLE_NAME || 'ShareSocialMedia';
  resetDynamoConnection();
  resetDocClient();
  await connectToDatabase();
  await ensureDefaultStorage();
}, 60_000);

/** DELETE /posts hard-deletes fileId; JSON posts share DEFAULT_IMAGE_ID. */
beforeEach(async () => {
  await ensureDefaultStorage();
});

afterAll(async () => {
  const client = getDocClient() as MemoryDocClient;
  if (typeof client._clear === 'function') {
    client._clear();
  }
  resetDynamoConnection();
});
