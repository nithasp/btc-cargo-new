import { Request, Response } from 'express';
import { userUpdateSchema } from '../schemas/user.schema';
import { userService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { currentUserId } from '../utils/request';
import { parseFields } from '../utils/validation';

// These routes have no id in the path: they only ever serve the account the token belongs to (OWASP API1)
export const show = asyncHandler(async (req: Request, res: Response) => {
  res.json(await userService.requireDetails(currentUserId(req)));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const changes = parseFields(userUpdateSchema, req.body);
  res.json(await userService.updateDetails(currentUserId(req), changes));
});

export const lineNotifyLink = asyncHandler(async () => {
  throw new AppError('LINE Notify was discontinued by LINE on 31 March 2025.', 410, 'not_configured');
});

export const lineNotifyRevoke = asyncHandler(async (req: Request, res: Response) => {
  await userService.revokeLineNotify(currentUserId(req));
  res.json({ success: true });
});
