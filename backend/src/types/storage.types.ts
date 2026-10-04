import { Readable } from 'stream';

export interface StoredObject {
  body: Readable;
  size?: number | undefined;
}

export interface StorageDriver {
  readonly name: 'r2' | 'local';
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<StoredObject | null>;
  delete(key: string): Promise<void>;
}

export interface R2Options {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}
