import { Router } from 'express';
import * as addresses from '../controllers/addresses.controller';
import * as catalog from '../controllers/catalog.controller';
import * as content from '../controllers/content.controller';
import * as reports from '../controllers/reports.controller';
import * as uploads from '../controllers/uploads.controller';
import * as users from '../controllers/users.controller';
import { verifyAuthToken } from '../middleware/auth';
import { singleFile } from '../middleware/upload';

const router = Router();

router.use(verifyAuthToken);

router.get('/user', users.show);
router.put('/user', users.update);
router.patch('/user', users.update);

router.get('/line_notify/link', users.lineNotifyLink);
router.post('/line_notify/revoke', users.lineNotifyRevoke);

router.get('/address', addresses.index);
router.post('/address', addresses.create);
router.get('/address/:id', addresses.show);
router.put('/address/:id', addresses.update);
router.patch('/address/:id', addresses.update);
router.delete('/address/:id', addresses.destroy);

router.get('/cart', catalog.cart);
router.post('/cart', catalog.createCart);
router.put('/cart/:id', catalog.updateCart);

router.get('/product', catalog.products);
router.get('/product/cart-test', catalog.cartTestProducts);
router.post('/nextship/get', catalog.importProduct);

router.get('/consent', content.consent);
router.get('/banner/:key', content.banner);
router.get('/notification/unread', content.unreadNotifications);
router.post('/notification/mark_all_read', content.markAllNotificationsRead);

router.get('/report/:name', reports.link);

router.get('/upload', uploads.index);
router.post('/upload', singleFile, uploads.create);
router.get('/upload/:id', uploads.show);
router.put('/upload/:id', singleFile, uploads.replace);
router.delete('/upload/:id', uploads.destroy);

export default router;
