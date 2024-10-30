import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(file: File, path: string) {
  const command = new PutObjectCommand({
    Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
    Key: path,
    Body: file,
    ContentType: file.type,
  });

  await r2Client.send(command);
  return path;
}

export async function getFileUrl(path: string) {
  const command = new GetObjectCommand({
    Bucket: import.meta.env.VITE_R2_BUCKET_NAME,
    Key: path,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}