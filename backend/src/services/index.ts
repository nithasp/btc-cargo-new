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
import { createAddressService } from './address.service';
import { createAffiliateService } from './affiliate.service';
import { createCatalogService } from './catalog.service';
import { createMasterDataService } from './masterData.service';
import { createNotificationService } from './notification.service';
import { createPaymentGatewayService } from './paymentGateway.service';
import { createReportService } from './report.service';
import { createSaleService } from './sale.service';
import { createSocialService } from './social.service';
import { createStorage } from './storage';
import { createTokenService } from './token.service';
import { createTrackingService } from './tracking.service';
import { createUploadService } from './upload.service';
import { createUserService } from './user.service';
import { createVerificationService } from './verification.service';
import { createWalletService } from './wallet.service';

const addresses = new AddressRepository();
const affiliates = new AffiliateRepository();
const carts = new CartRepository();
const contents = new ContentRepository();
const lots = new LotRepository();
const masterData = new MasterDataRepository();
const notifications = new NotificationRepository();
const paymentGateways = new PaymentGatewayRepository();
const products = new ProductRepository();
const refreshTokens = new RefreshTokenRepository();
const saleOrders = new SaleOrderRepository();
const socials = new SocialAccountRepository();
const trackings = new TrackingRepository();
const uploads = new UploadRepository();
const users = new UserRepository();
const verifications = new VerificationRepository();
const wallets = new WalletRepository();

export const notificationService = createNotificationService({ notifications });
export const tokenService = createTokenService({ refreshTokens, users });
export const userService = createUserService({ users, socials, addresses, wallets, notifications });
export const socialService = createSocialService({ users, socials, accounts: userService });
export const addressService = createAddressService({ addresses });
export const catalogService = createCatalogService({ carts, products });
export const masterDataService = createMasterDataService({ masterData, contents });
export const uploadService = createUploadService({ uploads, storage: createStorage() });
export const verificationService = createVerificationService({
  verifications,
  uploads: uploadService,
  users,
  notifications: notificationService,
});
export const walletService = createWalletService({ wallets });
export const affiliateService = createAffiliateService({ affiliates, verification: verificationService });
export const trackingService = createTrackingService({
  trackings,
  lots,
  masterData,
  uploads: uploadService,
  notifications: notificationService,
});
export const saleService = createSaleService({
  lots,
  saleOrders,
  paymentGateways,
  masterData,
  affiliates,
  affiliateAccess: affiliateService,
  users,
  notifications: notificationService,
});
export const paymentGatewayService = createPaymentGatewayService({
  paymentGateways,
  wallets,
  masterData,
  uploads: uploadService,
  verification: verificationService,
  notifications: notificationService,
});
export const reportService = createReportService({
  saleOrders,
  affiliates,
  affiliateAccess: affiliateService,
});
