import { Request, Response } from 'express';
import { embedParams, reportParams, reportRangeSchema } from '../schemas/report.schema';
import { reportService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { messagePage } from '../utils/reportPage';
import { currentUserId } from '../utils/request';
import { sendOk } from '../utils/response';
import { parse } from '../utils/validation';

export const link = asyncHandler(async (req: Request, res: Response) => {
  const { name } = parse(reportParams, req.params);
  sendOk(res, await reportService.link(currentUserId(req), name));
});

export const embed = asyncHandler(async (req: Request, res: Response) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const { token } = parse(embedParams, req.params);
    const range = parse(reportRangeSchema, req.query);
    res.type('html').send(await reportService.render(token, range));
  } catch (err) {
    if (!(err instanceof AppError) || err.statusCode >= 500) throw err;
    res.status(err.statusCode).type('html').send(messagePage('Report', err.message));
  }
});
