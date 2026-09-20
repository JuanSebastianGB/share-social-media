process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-characterization';
process.env.PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';
process.env.DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || 'memory';
process.env.TABLE_NAME = process.env.TABLE_NAME || 'ShareSocialMedia';
process.env.MEDIA_ENDPOINT = process.env.MEDIA_ENDPOINT || 'memory';
process.env.MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'test-media-bucket';
process.env.MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || 'https://media.local';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
