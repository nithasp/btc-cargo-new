import { Request, Response } from 'express';
import { z } from 'zod';
import { wholeNumber } from '../schemas/common.schema';
import { masterDataService, notificationService } from '../services';
import { CONSENT_KEY } from '../services/masterData.service';
import { asyncHandler } from '../utils/asyncHandler';
import { currentUserId } from '../utils/request';
import { sendOk } from '../utils/response';
import { parse } from '../utils/validation';

const keyParams = z.object({ key: z.string().regex(/^[a-z0-9_]{1,100}$/, 'is not a valid content key') });

const pageQuery = z.object({ page: wholeNumber(1, 100000).default(1) });

export const consent = asyncHandler(async (_req: Request, res: Response) => {
  sendOk(res, await masterDataService.htmlContent(CONSENT_KEY));
});

export const banner = asyncHandler(async (req: Request, res: Response) => {
  const { key } = parse(keyParams, req.params);
  sendOk(res, await masterDataService.htmlContent(key));
});

export const unreadNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page } = parse(pageQuery, req.query);
  const result = await notificationService.listUnread(currentUserId(req), page);
  res.json({ success: true, message: 'Success', data: result.data, page: result.page });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(currentUserId(req));
  sendOk(res, null);
});
