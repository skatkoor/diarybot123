import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.CLOUDFLARE_ACCOUNT_ID || 
    !process.env.R2_ACCESS_KEY_ID || 
    !process.env.R2_SECRET_ACCESS_KEY || 
    !process.env.R2_BUCKET_NAME) {
  throw new Error('Missing required R2 environment variables');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Error handling wrapper
export async function executeStorageOperation(operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error) {
    console.error('Storage operation failed:', error);
    throw new Error('Storage operation failed');
  }
}