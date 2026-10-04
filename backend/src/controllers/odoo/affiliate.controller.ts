import { Request, Response } from 'express';
import { affiliateVerificationSchema, memberSchema } from '../../schemas/affiliate.schema';
import { affiliateService } from '../../services';
import { asyncHandler } from '../../utils/asyncHandler';
import { currentUserId } from '../../utils/request';
import { sendOk } from '../../utils/response';
import { firstProblem, parse } from '../../utils/validation';

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendOk(res, await affiliateService.me(currentUserId(req)));
});

export const team = asyncHandler(async (req: Request, res: Response) => {
  sendOk(res, await affiliateService.team(currentUserId(req)));
});

export const createVerification = asyncHandler(async (req: Request, res: Response) => {
  const { upload_url, consent_url } = parse(affiliateVerificationSchema, req.body);
  sendOk(
    res,
    await affiliateService.submitVerification(currentUserId(req), upload_url, consent_url),
    'Verification submitted',
    201,
  );
});

// The agent form shows its "please fill in every field" message only for a 200 whose `success` is
// false, so an incomplete form is answered that way instead of with a 400
export const manage = asyncHandler(async (req: Request, res: Response) => {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.json({ success: false, message: firstProblem(parsed.error), data: null });
    return;
  }
  sendOk(res, await affiliateService.saveMember(currentUserId(req), parsed.data), 'Affiliate saved');
});
