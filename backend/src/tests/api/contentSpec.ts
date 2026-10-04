import fs from 'fs';
import { config } from '../../config';
import pool from '../../database';
import { TestUser } from '../../types/test.types';
import { api, ensureReferenceData, ODOO, PNG, registerUser } from '../support/api';

describe('Content, catalog and uploads', () => {
  let user: TestUser;
  let other: TestUser;

  beforeAll(async () => {
    await ensureReferenceData();
    user = await registerUser();
    other = await registerUser();
  });

  afterAll(() => {
    fs.rmSync(config.storage.localDir, { recursive: true, force: true });
  });

  describe('reference data', () => {
    it('serves every list in the { success, message, data } envelope', async () => {
      const paths = [
        'product_types',
        'stock_picking_type',
        'locations',
        'shop_types',
        'carrier/thai',
        'delivery_type',
        'local_delivery',
        'payment_gateway/alipay_account',
      ];
      for (const path of paths) {
        const res = await user.get(`${ODOO}/config/${path}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      }
      expect((await user.get(`${ODOO}/config/system`)).body.data.api_version).toBeDefined();
      expect((await api.get(`${ODOO}/config/delivery_type`)).status).toBe(401);
    });

    it('keeps the ids and names the frontend hardcodes', async () => {
      const carriers = (await user.get(`${ODOO}/config/carrier/thai`)).body.data;
      expect(carriers[0].id).toBe(2);

      const locations = (await user.get(`${ODOO}/config/locations`)).body.data.map(
        (l: { display_name: string }) => l.display_name,
      );
      expect(locations).toEqual(jasmine.arrayContaining(['CN-WH/Stock', 'Transit', 'TH-WH/Stock']));

      expect((await user.get(`${ODOO}/config/delivery_type`)).body.data[0].id).toBe(1);
      expect((await user.get(`${ODOO}/config/payment_gateway/alipay_account`)).body.data[0].id).toBe(1);
    });

    it('reports the exchange rate and whether the service is open', async () => {
      const status = await user.get(`${ODOO}/currencies/status?service=payment`);
      expect(status.body.data).toEqual({ status: true });

      const rates = await user.get(`${ODOO}/currencies/payment?service=payment`);
      expect(rates.body.data[0].payment.rate).toBeGreaterThan(0);
      expect(rates.body.data[0].payment.is_online).toBe(true);
    });
  });

  describe('page content', () => {
    it('serves the consent text and the keyed banners', async () => {
      const consent = await user.get('/api/consent/');
      expect(consent.body.data.html).toContain('PDPA');

      for (const key of [
        'terms_and_conditions',
        'payment_announcement',
        'payment_service_conditions',
        'warehouse_address_remark',
        'international_shipping_rate',
      ]) {
        const res = await user.get(`/api/banner/${key}/`);
        expect(res.status).toBe(200);
        expect(res.body.data.key).toBe(key);
      }
      expect((await user.get('/api/banner/missing/')).status).toBe(404);
      expect((await user.get('/api/banner/..%2Fetc/')).status).toBe(400);
    });
  });

  describe('notifications', () => {
    it('pages unread notices and clears them', async () => {
      const reader = await registerUser();
      for (let index = 0; index < 12; index += 1) {
        await pool.query(
          "INSERT INTO notifications (user_id, actor, title, message) VALUES ($1, 'BTC', 'T', $2)",
          [reader.id, `message ${index}`],
        );
      }

      const first = await reader.get('/api/notification/unread/?page=1');
      expect(first.body.success).toBe(true);
      expect(first.body.data.length).toBe(10);
      expect(first.body.page.count).toBe(13);
      expect(first.body.page.next).toContain('page=2');
      expect(first.body.data[0].notification.timestamp).toBeDefined();

      const second = await reader.get('/api/notification/unread/?page=2');
      expect(second.body.data.length).toBe(3);
      expect(second.body.page.next).toBeNull();

      await reader.post('/api/notification/mark_all_read/').expect(200);
      const cleared = await reader.get('/api/notification/unread/?page=1');
      expect(cleared.body.data).toEqual([]);
      expect(cleared.body.page.count).toBe(0);
    });
  });

  describe('catalog and cart', () => {
    it('lists products with their variants and pictures', async () => {
      const res = await user.get('/api/product/');
      const [product] = res.body;

      expect(res.body.length).toBeGreaterThan(0);
      expect(typeof product.price).toBe('string');
      expect(Array.isArray(product.variants)).toBe(true);
      expect(product.uploads[0].file).toContain('data:image/png;base64,');
      expect(typeof product.shop_name).toBe('string');
    });

    it('stores one cart per user', async () => {
      expect((await user.get('/api/cart/')).body).toEqual([]);

      const json = [{ shop_id: 1, shop_name: 'Shop', products: [{ id: 1, quantity: 2 }] }];
      const created = await user.post('/api/cart/', { json, user: other.id });
      expect(created.status).toBe(201);
      expect(created.body.user).toBe(user.id);

      const listed = await user.get('/api/cart/');
      expect(listed.body.length).toBe(1);
      expect(listed.body[0].json).toEqual(json);

      const updated = await user.put(`/api/cart/${created.body.id}/`, { json: [], user: user.id });
      expect(updated.body.json).toEqual([]);

      expect((await other.put(`/api/cart/${created.body.id}/`, { json: [] })).status).toBe(404);
      expect((await user.post('/api/cart/', { json: 'not a list' })).status).toBe(400);
    });

    it('returns a product for a link pasted on the purchase page', async () => {
      const res = await user.post('/api/nextship/get', {
        url: 'https://item.taobao.com/item.htm?id=1',
        mock: 'true',
      });
      expect(res.body.item.item_imgs.length).toBeGreaterThan(0);
      expect(res.body.item.properties[20509].types.length).toBeGreaterThan(0);
      expect(res.body.item.sku[0].orginal_price).toBeGreaterThan(0);
      expect((await user.post('/api/nextship/get', {})).status).toBe(400);
    });
  });

  describe('uploads', () => {
    it('stores a file and answers with a path relative to the API', async () => {
      const res = await user.upload('payment', PNG, 'สลิป.png');
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/^\/media\/uploads\/\d+\/[0-9a-f-]{36}\.png$/);
      expect(res.body.data.filename).toBe('สลิป.png');
      expect(res.body.data.url).not.toContain('สลิป');
    });

    it('decides the type from the content, not from the name or the declared type', async () => {
      const html = Buffer.from('<html><script>alert(1)</script></html>');
      expect((await user.upload('payment', html, 'photo.png')).status).toBe(400);
      expect(
        (await user.upload('payment', Buffer.from('MZ\x90\x00 executable bytes'), 'photo.jpg')).status,
      ).toBe(400);

      const renamed = await user.upload('payment', PNG, 'malware.exe');
      expect(renamed.status).toBe(201);
      expect(renamed.body.data.content_type).toBe('image/png');
      expect(renamed.body.data.url.endsWith('.png')).toBe(true);
    });

    it('rejects a missing file and one over the size limit', async () => {
      expect((await user.post('/api/upload/')).status).toBe(400);

      const big = Buffer.concat([PNG, Buffer.alloc(config.storage.maxBytes)]);
      expect((await user.upload('payment', big, 'big.png')).status).toBe(413);
    });

    it('serves a file to its owner only', async () => {
      const { url } = (await user.upload('payment').expect(201)).body.data;

      const mine = await user.get(url);
      expect(mine.status).toBe(200);
      expect(mine.type).toBe('image/png');
      expect(Buffer.compare(mine.body as Buffer, PNG)).toBe(0);

      expect((await other.get(url)).status).toBe(404);
      expect((await api.get(url)).status).toBe(401);
      expect((await user.get('/media/uploads/../../.env')).status).toBe(404);
    });

    it('replaces and deletes a file, removing the stored object', async () => {
      const created = (await user.upload('payment').expect(201)).body.data;

      const replaced = await api
        .put(`/api/upload/${created.id}/`)
        .set('Authorization', `Token ${user.key}`)
        .attach('file', PNG, 'new.png');
      expect(replaced.status).toBe(200);
      expect(replaced.body.data.url).not.toBe(created.url);
      expect((await user.get(created.url)).status).toBe(404);
      expect((await user.get(replaced.body.data.url)).status).toBe(200);

      expect((await other.delete(`/api/upload/${created.id}/`)).status).toBe(404);
      await user.delete(`/api/upload/${created.id}/`).expect(200);
      expect((await user.get(replaced.body.data.url)).status).toBe(404);
      expect((await user.get(`/api/upload/${created.id}/`)).status).toBe(404);
    });
  });
});
