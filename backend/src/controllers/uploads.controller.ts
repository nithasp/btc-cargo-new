import { Request, Response } from 'express';
import { pipeline } from 'stream/promises';
import { z } from 'zod';
import { idParams } from '../schemas/common.schema';
import { uploadService } from '../services';
import { IncomingFile } from '../types/upload.types';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { currentUserId } from '../utils/request';
import { sendOk } from '../utils/response';
import { parse } from '../utils/validation';

const uploadFields = z.object({
  type: z.string().trim().max(50, 'must be at most 50 characters').default(''),
});

const MEDIA_CACHE = 'private, max-age=300';

function requireFile(req: Request): IncomingFile {
  if (!req.file) throw new AppError('file is required', 400, 'invalid_request');
  return req.file;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { type } = parse(uploadFields, req.body ?? {});
  sendOk(res, await uploadService.create(currentUserId(req), requireFile(req), type), 'Uploaded', 201);
});

export const index = asyncHandler(async (req: Request, res: Response) => {
  sendOk(res, await uploadService.list(currentUserId(req)));
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  sendOk(res, await uploadService.get(id, currentUserId(req)));
});

export const replace = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  sendOk(res, await uploadService.replace(id, currentUserId(req), requireFile(req)), 'Replaced');
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  await uploadService.remove(id, currentUserId(req));
  sendOk(res, null, 'Deleted');
});

// Uploads hold ID cards and payment slips, so a file is streamed only to its owner (or to staff)
// and never served from a public bucket address
export const media = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication credentials were not provided.', 401, 'no_token');

  const segments: unknown = req.params.key;
  const storageKey = Array.isArray(segments) ? segments.join('/') : String(segments ?? '');
  const { upload, object } = await uploadService.open(storageKey, req.user);

  res.setHeader('Content-Type', upload.contentType);
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(upload.originalName)}`);
  res.setHeader('Cache-Control', MEDIA_CACHE);
  if (object.size !== undefined) res.setHeader('Content-Length', object.size);

  await pipeline(object.body, res);
});
