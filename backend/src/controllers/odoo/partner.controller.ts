import { Request, Response } from 'express';
import { partnerVerificationSchema } from '../../schemas/affiliate.schema';
import { newWalletSchema, walletQuerySchema, walletUpdateSchema } from '../../schemas/wallet.schema';
import { verificationService, walletService } from '../../services';
import { asyncHandler } from '../../utils/asyncHandler';
import { currentUserId } from '../../utils/request';
import { sendOk } from '../../utils/response';
import { parse } from '../../utils/validation';

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = currentUserId(req);
  const [verification_state, yuan_balance] = await Promise.all([
    verificationService.state(userId, 'partner'),
    walletService.balance(userId),
  ]);
  sendOk(res, { verification_state, yuan_balance });
});

// The exchange page reads the new state from the first element, so the result is a list
export const createVerification = asyncHandler(async (req: Request, res: Response) => {
  const { upload_url } = parse(partnerVerificationSchema, req.body);
  const created = await verificationService.submit(currentUserId(req), 'partner', [
    { url: upload_url, category: 'bank_book' },
  ]);
  sendOk(res, [created], 'Verification submitted', 201);
});

export const wallets = asyncHandler(async (req: Request, res: Response) => {
  const { active } = parse(walletQuerySchema, req.query);
  sendOk(res, await walletService.list(currentUserId(req), active));
});

export const newWallet = asyncHandler(async (req: Request, res: Response) => {
  const { name } = parse(newWalletSchema, req.body);
  sendOk(res, await walletService.create(currentUserId(req), name), 'Wallet created', 201);
});

export const updateWallet = asyncHandler(async (req: Request, res: Response) => {
  const input = parse(walletUpdateSchema, req.body);
  sendOk(res, await walletService.update(currentUserId(req), input), 'Wallet updated');
});
