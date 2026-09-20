import { DEFAULT_IMAGE_ID } from '../constants/constants.js';
import { connectToDatabase, resetDynamoConnection } from '../database/dynamo.js';
import { getDocClient, resetDocClient } from '../db/client.js';
import type { MemoryDocClient } from '../db/memoryClient.js';
import { MediaFile } from '../modules/media/domain/media-file.js';
import { DynamoMediaFileRepository } from '../modules/media/infrastructure/dynamodb-media-file-repository.js';
import { getFileService } from '../services/storage.js';

const mediaFileRepository = new DynamoMediaFileRepository();

async function ensureDefaultStorage() {
  const file = await getFileService(DEFAULT_IMAGE_ID);
  if (!file) {
    await mediaFileRepository.save(
      MediaFile.create({
        id: DEFAULT_IMAGE_ID,
        fileName: 'default-stub',
        url: 'https://media.local/uploads/default.jpg',
      }),
    );
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
