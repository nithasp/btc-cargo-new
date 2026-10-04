import crypto from 'crypto';
import path from 'path';
import { logger } from '../logger';
import { UploadServiceDeps } from '../types/service.types';
import { StoredObject } from '../types/storage.types';
import { IncomingFile, Upload, UploadView } from '../types/upload.types';
import { UserRole } from '../types/user.types';
import { AppError, notFound } from '../utils/errors';
import { detectFileType } from '../utils/fileType';

// The frontend builds an absolute address as API base + this path, so `url` must stay relative
export const MEDIA_PREFIX = '/media/';

const ALLOWED_TYPES = 'JPEG, PNG, WebP, GIF, HEIC or PDF';
const MAX_NAME_LENGTH = 255;

function keyFromUrl(url: string): string | null {
  const index = url.indexOf(MEDIA_PREFIX);
  if (index === -1) return null;
  const raw = url.slice(index + MEDIA_PREFIX.length).split(/[?#]/)[0] ?? '';
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return null;
  }
}

export function toUploadView(upload: Upload): UploadView {
  return {
    id: upload.id,
    filename: upload.originalName,
    url: `${MEDIA_PREFIX}${upload.storageKey}`,
    type: upload.type,
    content_type: upload.contentType,
    size: upload.size,
    created_at: upload.createdAt,
  };
}

export function createUploadService({ uploads, storage }: UploadServiceDeps) {
  async function store(userId: number, file: IncomingFile) {
    const detected = detectFileType(file.buffer);
    if (!detected) {
      throw new AppError(`Unsupported file type. Upload a ${ALLOWED_TYPES} file.`, 400, 'invalid_request');
    }

    // The object key is random and never derived from the client's file name
    const storageKey = `uploads/${userId}/${crypto.randomUUID()}.${detected.ext}`;
    await storage.put(storageKey, file.buffer, detected.mime);

    return {
      storageKey,
      contentType: detected.mime,
      size: file.buffer.length,
      originalName: path.basename(file.originalname || 'file').slice(0, MAX_NAME_LENGTH),
    };
  }

  const discard = (storageKey: string): Promise<void> =>
    storage
      .delete(storageKey)
      .catch((err: unknown) => logger.warn({ err, storageKey }, 'could not delete stored object'));

  async function requireOwn(id: number, userId: number): Promise<Upload> {
    const upload = await uploads.findForUser(id, userId);
    if (!upload) throw notFound('Upload');
    return upload;
  }

  return {
    async create(userId: number, file: IncomingFile, type: string): Promise<UploadView> {
      const stored = await store(userId, file);
      try {
        return toUploadView(await uploads.create({ userId, type, ...stored }));
      } catch (err) {
        await discard(stored.storageKey);
        throw err;
      }
    },

    async list(userId: number): Promise<UploadView[]> {
      return (await uploads.listByUser(userId)).map(toUploadView);
    },

    async get(id: number, userId: number): Promise<UploadView> {
      return toUploadView(await requireOwn(id, userId));
    },

    async replace(id: number, userId: number, file: IncomingFile): Promise<UploadView> {
      const existing = await requireOwn(id, userId);
      const stored = await store(userId, file);

      const updated = await uploads.replaceFile(id, stored).catch(async (err: unknown) => {
        await discard(stored.storageKey);
        throw err;
      });
      if (!updated) {
        await discard(stored.storageKey);
        throw notFound('Upload');
      }

      await discard(existing.storageKey);
      return toUploadView(updated);
    },

    async remove(id: number, userId: number): Promise<void> {
      const existing = await requireOwn(id, userId);
      await uploads.delete(existing.id);
      await discard(existing.storageKey);
    },

    // Turns an address the client sends back (a slip, an ID card, a proof of purchase) into the
    // upload row, and only when that upload is the caller's own (OWASP API1)
    async resolveOwned(userId: number, url: string): Promise<Upload> {
      const storageKey = keyFromUrl(url);
      const upload = storageKey ? await uploads.findByKey(storageKey) : null;
      if (!upload || upload.userId !== userId) {
        throw new AppError('The file is not one of your uploads.', 400, 'invalid_request');
      }
      return upload;
    },

    // A file that exists but belongs to someone else answers 404 as well, so the route does not
    // confirm which keys exist
    async open(
      storageKey: string,
      requester: { userId: number; role: UserRole },
    ): Promise<{ upload: Upload; object: StoredObject }> {
      const upload = await uploads.findByKey(storageKey);
      if (!upload || (upload.userId !== requester.userId && requester.role !== 'admin')) {
        throw notFound('File');
      }

      const object = await storage.get(upload.storageKey);
      if (!object) throw notFound('File');
      return { upload, object };
    },
  };
}

export type UploadService = ReturnType<typeof createUploadService>;
