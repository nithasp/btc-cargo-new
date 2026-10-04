import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { R2Options, StorageDriver } from '../../types/upload.types';

// The bucket stays private: objects are only ever read back through this API, which checks who is
// asking first
export function createR2Storage({
  endpoint,
  accessKeyId,
  secretAccessKey,
  bucket,
}: R2Options): StorageDriver {
  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    // The SDK's default CRC32 checksum headers are not accepted by R2 on every operation
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  return {
    name: 'r2',

    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
      );
    },

    async get(key) {
      try {
        const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!(object.Body instanceof Readable)) return null;
        return { body: object.Body, size: object.ContentLength };
      } catch (err) {
        if ((err as { name?: string }).name === 'NoSuchKey') return null;
        throw err;
      }
    },

    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}
