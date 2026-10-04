import { Readable } from 'stream';

export interface Upload {
  id: number;
  userId: number;
  storageKey: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
  createdAt: Date;
}

export interface NewUpload {
  userId: number;
  storageKey: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
}

export interface IncomingFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

export interface DetectedFile {
  ext: string;
  mime: string;
}

export interface UploadView {
  id: number;
  filename: string;
  url: string;
  type: string;
  content_type: string;
  size: number;
  created_at: Date;
}

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
