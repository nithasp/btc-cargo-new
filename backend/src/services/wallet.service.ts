import { WalletUpdateInput } from '../schemas/wallet.schema';
import { WalletServiceDeps } from '../types/service.types';
import { Wallet } from '../types/wallet.types';
import { AppError, notFound } from '../utils/errors';

export function createWalletService({ wallets }: WalletServiceDeps) {
  return {
    list(userId: number, active: boolean | undefined): Promise<Wallet[]> {
      return wallets.list(userId, active);
    },

    balance(userId: number): Promise<number> {
      return wallets.totalCredit(userId);
    },

    async create(userId: number, name: string): Promise<Wallet[]> {
      await wallets.create(userId, name);
      return wallets.list(userId, true);
    },

    // "Deleting" a wallet deactivates it. One with credit left is kept, as is the last one: the
    // exchange form needs at least one wallet to choose from.
    async update(userId: number, input: WalletUpdateInput): Promise<Wallet[]> {
      const wallet = await wallets.findForUser(input.wallet_id, userId);
      if (!wallet) throw notFound('Wallet');

      if (input.active === false && wallet.active) {
        if (wallet.credit_amount > 0) {
          throw new AppError('A wallet with a remaining balance cannot be deleted.', 400, 'invalid_request');
        }
        if ((await wallets.countActive(userId)) <= 1) {
          throw new AppError('The last wallet cannot be deleted.', 400, 'invalid_request');
        }
      }

      await wallets.update(wallet.id, { name: input.name, active: input.active });
      return wallets.list(userId, true);
    },
  };
}

export type WalletService = ReturnType<typeof createWalletService>;
