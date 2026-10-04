import { Router } from 'express';
import * as affiliate from '../../controllers/odoo/affiliate.controller';
import * as config from '../../controllers/odoo/config.controller';
import * as partner from '../../controllers/odoo/partner.controller';
import * as payment from '../../controllers/odoo/payment.controller';
import * as sale from '../../controllers/odoo/sale.controller';
import { verifyAuthToken } from '../../middleware/auth';

const router = Router();

router.use(verifyAuthToken);

router.get('/config/system', config.system);
router.get('/config/product_types', config.productTypes);
router.get('/config/stock_picking_type', config.stockPickingTypes);
router.get('/config/locations', config.stockLocations);
router.get('/config/shop_types', config.shopTypes);
router.get('/config/carrier/thai', config.thaiCarriers);
router.get('/config/delivery_type', config.deliveryTypes);
router.get('/config/local_delivery', config.localDeliveries);
router.get('/config/payment_gateway/alipay_account', config.alipayAccounts);

router.get('/currencies/status', config.currencyStatus);
router.get('/currencies/payment', config.currencies);

router.get('/partner/me', partner.me);
router.post('/partner/create_verification', partner.createVerification);
router.get('/partner/wallet', partner.wallets);
router.post('/partner/new_wallet', partner.newWallet);
router.post('/partner/update_wallet', partner.updateWallet);

router.get('/affiliate/me', affiliate.me);
router.get('/affiliate/team', affiliate.team);
router.post('/affiliate/create_verification', affiliate.createVerification);
router.post('/affiliate/manage', affiliate.manage);

router.get('/payment_gateway/list', payment.index);
router.post('/payment_gateway/payment', payment.createExchange);
router.get('/payment_gateway/:id', payment.show);
router.post('/payment/create', payment.createPayment);

router.post('/sale/china/tracking/register', sale.registerTracking);
router.post('/sale/china/tracking/update', sale.updateTracking);
router.post('/sale/china/tracking/check', sale.checkTracking);
router.get('/sale/china/tracking/list', sale.trackingList);
router.get('/sale/china/tracking', sale.trackingDetails);

router.post('/sale/quotation', sale.quotation);
router.get('/sale/summary', sale.summary);
router.post('/sale/order/discount', sale.discount);

router.get('/to/confirm', sale.toConfirm);
router.post('/to/confirm/submit', sale.submitToConfirm);

export default router;
