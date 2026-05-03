require('dotenv').config();
import { Storage } from '@google-cloud/storage';
import * as path from 'node:path';

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const keyFilename = path.join(process.cwd(), 'config', 'gcp-key.json');

if (!bucketName) {
  throw new Error('GOOGLE_CLOUD_BUCKET_NAME is required');
}

const storage = new Storage({ keyFilename });
const bucket = storage.bucket(bucketName);

function buildPublicUrl(objectKey: string): string {
  return `https://storage.googleapis.com/${bucketName}/${objectKey}`;
}

export async function uploadBufferToGcs(
  objectKey: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const file = bucket.file(objectKey);
  await file.save(buffer, {
    resumable: false,
    metadata: { contentType },
  });
}

export async function deleteFromGcs(objectKey: string): Promise<void> {
  if (!objectKey) return;

  try {
    await bucket.file(objectKey).delete();
  } catch (error: any) {
    if (error?.code !== 404) {
      throw error;
    }
  }
}

export async function deleteManyFromGcs(objectKeys: string[]): Promise<void> {
  for (const objectKey of objectKeys) {
    if (!objectKey) continue;
    await deleteFromGcs(objectKey);
  }
}

export async function moveObjectInGcs(
  fromObjectKey: string,
  toObjectKey: string,
): Promise<void> {
  if (!fromObjectKey || !toObjectKey || fromObjectKey === toObjectKey) return;

  const fromFile = bucket.file(fromObjectKey);
  await fromFile.copy(bucket.file(toObjectKey));
  await fromFile.delete();
}

export function resolvePublicImageUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('https://') || value.startsWith('http://')) return value;
  return buildPublicUrl(value);
}
