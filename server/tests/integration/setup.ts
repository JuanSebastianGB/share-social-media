import {
  startDynamoLocal,
  stopDynamoLocal,
  getIntegrationSkipReason,
} from './dynamodb-local.js';

beforeAll(async () => {
  await startDynamoLocal();
}, 120_000);

beforeEach(() => {
  const reason = getIntegrationSkipReason();
  if (reason) {
    pending(reason);
  }
});

afterAll(async () => {
  await stopDynamoLocal();
}, 60_000);
