import { AddressRepository } from '../repositories/address.repository';
import { AffiliateRepository } from '../repositories/affiliate.repository';
import { CartRepository } from '../repositories/cart.repository';
import { ContentRepository, NotificationRepository } from '../repositories/content.repository';
import { LotRepository } from '../repositories/lot.repository';
import { MasterDataRepository } from '../repositories/masterData.repository';
import { PaymentGatewayRepository } from '../repositories/paymentGateway.repository';
import { ProductRepository } from '../repositories/product.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { SaleOrderRepository } from '../repositories/saleOrder.repository';
import { SocialAccountRepository } from '../repositories/socialAccount.repository';
import { TrackingRepository } from '../repositories/tracking.repository';
import { UploadRepository } from '../repositories/upload.repository';
import { UserRepository } from '../repositories/user.repository';
import { VerificationRepository } from '../repositories/verification.repository';
import { WalletRepository } from '../repositories/wallet.repository';
import { AffiliateTeam, CreatedVerification, VerificationKind, VerificationState } from './affiliate.types';
import { NewNotification } from './content.types';
import { Queryable } from './database.types';
import { StorageDriver, Upload } from './upload.types';
import { AuthUser, NewUserRow } from './user.types';

export interface Notifier {
  notify(userId: number, entry: NewNotification, db?: Queryable): Promise<void>;
  notifyQuietly(userId: number, entry: NewNotification): void;
}

export interface AccountCreator {
  createAccount(row: NewUserRow): Promise<AuthUser>;
}

export interface OwnedUploads {
  resolveOwned(userId: number, url: string): Promise<Upload>;
}

export interface VerificationGate {
  state(userId: number, kind: VerificationKind): Promise<VerificationState>;
  requireVerified(userId: number, kind: VerificationKind): Promise<void>;
}

export interface AffiliateAccess {
  requireTeam(userId: number): Promise<AffiliateTeam>;
}

export interface TokenServiceDeps {
  refreshTokens: RefreshTokenRepository;
  users: Pick<UserRepository, 'findAuthById'>;
}

export interface NotificationServiceDeps {
  notifications: NotificationRepository;
}

export interface UserServiceDeps {
  users: UserRepository;
  socials: Pick<SocialAccountRepository, 'listByUser'>;
  addresses: Pick<AddressRepository, 'findForUser'>;
  wallets: Pick<WalletRepository, 'create'>;
  notifications: Pick<NotificationRepository, 'create'>;
}

export interface SocialServiceDeps {
  users: Pick<UserRepository, 'findAuthById' | 'usernameExists' | 'emailExists'>;
  socials: SocialAccountRepository;
  accounts: AccountCreator;
}

export interface AddressServiceDeps {
  addresses: AddressRepository;
}

export interface CatalogServiceDeps {
  carts: CartRepository;
  products: ProductRepository;
}

export interface MasterDataServiceDeps {
  masterData: MasterDataRepository;
  contents: ContentRepository;
}

export interface UploadServiceDeps {
  uploads: UploadRepository;
  storage: StorageDriver;
}

export interface VerificationServiceDeps {
  verifications: VerificationRepository;
  uploads: OwnedUploads;
  users: Pick<UserRepository, 'displayName'>;
  notifications: Notifier;
}

export interface WalletServiceDeps {
  wallets: WalletRepository;
}

export interface TrackingServiceDeps {
  trackings: TrackingRepository;
  lots: LotRepository;
  masterData: Pick<MasterDataRepository, 'deliveryTypeExists'>;
  uploads: OwnedUploads;
  notifications: Notifier;
}

export interface SaleServiceDeps {
  lots: Pick<LotRepository, 'lockReadyForUser' | 'assignSaleOrder'>;
  saleOrders: SaleOrderRepository;
  paymentGateways: Pick<PaymentGatewayRepository, 'create'>;
  masterData: Pick<MasterDataRepository, 'carrierExists' | 'findLocalDelivery'>;
  affiliates: Pick<AffiliateRepository, 'attributionByCode'>;
  affiliateAccess: AffiliateAccess;
  users: Pick<UserRepository, 'referralCodeOf'>;
  notifications: Notifier;
}

export interface PaymentGatewayServiceDeps {
  paymentGateways: PaymentGatewayRepository;
  wallets: Pick<WalletRepository, 'lockForUser' | 'debit'>;
  masterData: Pick<MasterDataRepository, 'currency' | 'alipayAccountActive'>;
  uploads: OwnedUploads;
  verification: VerificationGate;
  notifications: Notifier;
}

export interface AffiliateServiceDeps {
  affiliates: AffiliateRepository;
  verification: VerificationGate & {
    submit(
      userId: number,
      kind: VerificationKind,
      images: { url: string; category: string }[],
    ): Promise<CreatedVerification>;
  };
}

export interface ReportServiceDeps {
  saleOrders: Pick<SaleOrderRepository, 'commissionByDay' | 'commissionByMember'>;
  affiliates: Pick<AffiliateRepository, 'findTeamByOwner'>;
  affiliateAccess: AffiliateAccess;
}
