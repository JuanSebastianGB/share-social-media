process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-integration';
process.env.PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';
process.env.TABLE_NAME = process.env.TABLE_NAME || 'ShareSocialMedia';
process.env.MEDIA_ENDPOINT = process.env.MEDIA_ENDPOINT || 'memory';
process.env.MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'test-media-bucket';
process.env.MEDIA_BASE_URL =
  process.env.MEDIA_BASE_URL || 'https://media.local';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'local';
process.env.AWS_SECRET_ACCESS_KEY =
  process.env.AWS_SECRET_ACCESS_KEY || 'local';
// DYNAMODB_ENDPOINT is set after DynamoDB Local container starts.

// Silence app/library noise during integration runs: express-expeditious
// engine notice and the "Connected to DynamoDB local" log. Must run before
// any module is required so the cache middleware constructor doesn't warn.
console.warn = () => {};
console.log = () => {};
