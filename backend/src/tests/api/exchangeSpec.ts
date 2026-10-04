import pool from '../../database';
import { TestUser } from '../../types/test.types';
import { creditWallet, ensureReferenceData, ODOO, registerUser, verify } from '../support/api';

const EXCHANGE = `${ODOO}/payment_gateway/payment?service=payment`;
const BANK = {
  payment_gateway_type: 'bank',
  amount: 1000,
  account_type: 'detail',
  account_name: 'Shop',
  account_number: '6222000011112222',
};

describe('Yuan exchange', () => {
  let rate: number;

  beforeAll(async () => {
    await ensureReferenceData();
    const { rows } = await pool.query("SELECT rate FROM currency_rates WHERE service = 'payment'");
    rate = rows[0]?.rate as number;
  });

  describe('identity verification', () => {
    it('starts unverified, moves to reviewing, and blocks exchange until verified', async () => {
      const user = await registerUser();

      const start = await user.get(`${ODOO}/partner/me`);
      expect(start.body.data).toEqual({ verification_state: 'unverified', yuan_balance: 0 });
      expect((await user.post(EXCHANGE, BANK)).status).toBe(403);

      const book = await user.upload('beach').expect(201);
      const submitted = await user.post(`${ODOO}/partner/create_verification`, {
        upload_url: book.body.data.url,
      });
      expect(submitted.status).toBe(201);
      expect(submitted.body.data[0].state).toBe('reviewing');
      expect(submitted.body.data[0].images[0].url).toBe(book.body.data.url);

      expect((await user.get(`${ODOO}/partner/me`)).body.data.verification_state).toBe('reviewing');
      expect(
        (await user.post(`${ODOO}/partner/create_verification`, { upload_url: book.body.data.url })).status,
      ).toBe(409);
      expect((await user.post(EXCHANGE, BANK)).status).toBe(403);
    });

    it("does not accept another user's upload as proof", async () => {
      const user = await registerUser();
      const other = await registerUser();
      const theirs = await other.upload('beach').expect(201);

      const res = await user.post(`${ODOO}/partner/create_verification`, {
        upload_url: theirs.body.data.url,
      });
      expect(res.status).toBe(400);
      expect((await user.get(`${ODOO}/partner/me`)).body.data.verification_state).toBe('unverified');
    });
  });

  describe('wallets', () => {
    let user: TestUser;

    beforeAll(async () => {
      user = await registerUser();
    });

    it('gives every account one wallet to start with', async () => {
      const res = await user.get(`${ODOO}/partner/wallet?active=true`);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].credit_amount).toBe(0);
      expect(typeof res.body.data[0].display_name).toBe('string');
    });

    it('adds, renames and deletes wallets, keeping names unique', async () => {
      const added = await user.post(`${ODOO}/partner/new_wallet`, { name: 'Taobao' });
      expect(added.status).toBe(201);
      const wallet = added.body.data.find((item: { name: string }) => item.name === 'Taobao');

      expect((await user.post(`${ODOO}/partner/new_wallet`, { name: 'taobao' })).status).toBe(409);
      expect((await user.post(`${ODOO}/partner/new_wallet`, { name: '' })).status).toBe(400);

      const renamed = await user.post(`${ODOO}/partner/update_wallet`, {
        wallet_id: wallet.id,
        name: 'Tmall',
        active: true,
      });
      expect(renamed.body.data.some((item: { name: string }) => item.name === 'Tmall')).toBe(true);

      const removed = await user.post(`${ODOO}/partner/update_wallet`, {
        wallet_id: wallet.id,
        name: 'Tmall',
        active: false,
      });
      expect(removed.body.data.some((item: { id: number }) => item.id === wallet.id)).toBe(false);
    });

    it("keeps the last wallet, a wallet with credit, and other people's wallets", async () => {
      const owner = await registerUser();
      const other = await registerUser();
      const [wallet] = (await owner.get(`${ODOO}/partner/wallet`)).body.data;

      expect(
        (await owner.post(`${ODOO}/partner/update_wallet`, { wallet_id: wallet.id, active: false })).status,
      ).toBe(400);

      await owner.post(`${ODOO}/partner/new_wallet`, { name: 'Second' }).expect(201);
      await creditWallet(owner.id, 50);
      expect(
        (await owner.post(`${ODOO}/partner/update_wallet`, { wallet_id: wallet.id, active: false })).status,
      ).toBe(400);

      expect(
        (await other.post(`${ODOO}/partner/update_wallet`, { wallet_id: wallet.id, name: 'Mine now' }))
          .status,
      ).toBe(404);
    });
  });

  describe('POST /payment_gateway/payment', () => {
    it('prices a bank transfer from the stored rate, whatever the client claims', async () => {
      const user = await registerUser();
      await verify(user.id, 'partner');

      const res = await user.post(EXCHANGE, { ...BANK, amount_currency: 1, rate: 0.01, state: 'done' });
      expect(res.status).toBe(201);
      expect(res.body.data.state).toBe('wait');
      expect(res.body.data.service_type).toBe('payment');
      expect(res.body.data.amount_currency).toBeCloseTo(1000 * rate, 2);
      expect(res.body.data.quantity_with_symbol).toBe('1,000.00 ¥');

      const list = await user.get(`${ODOO}/payment_gateway/list?page=1&pageSize=10&service=payment`);
      expect(list.body.data.records.length).toBe(1);
      expect(list.body.data.pagination.records).toBe(1);
      expect((await user.get(`${ODOO}/payment_gateway/list?service=delivery`)).body.data.records.length).toBe(
        0,
      );
    });

    it('spends wallet credit on an Alipay order and never more than the wallet holds', async () => {
      const user = await registerUser();
      await verify(user.id, 'partner');
      const walletId = await creditWallet(user.id, 200);

      const order = (splits: object[]) =>
        user.post(EXCHANGE, { payment_gateway_type: 'alipay', alipay_account_id: 1, amount_split: splits });

      expect((await order([{ wallet_id: walletId, amount: 500, use_credit_amount: 201 }])).status).toBe(400);
      expect((await order([{ wallet_id: walletId, amount: 100, use_credit_amount: 150 }])).status).toBe(400);
      expect((await order([{ wallet_id: walletId, amount: 500, use_credit_amount: -1 }])).status).toBe(400);
      expect((await order([{ wallet_id: 999999, amount: 500, use_credit_amount: 0 }])).status).toBe(400);
      expect((await user.get(`${ODOO}/partner/me`)).body.data.yuan_balance).toBe(200);

      const res = await order([
        { wallet_id: walletId, amount: 300, use_credit_amount: 120 },
        { wallet_id: walletId, amount: 200, use_credit_amount: 80 },
      ]);
      expect(res.status).toBe(201);
      expect(res.body.data.amount_currency).toBeCloseTo(300 * rate, 2);
      expect((await user.get(`${ODOO}/partner/me`)).body.data.yuan_balance).toBe(0);

      expect((await order([{ wallet_id: walletId, amount: 50, use_credit_amount: 1 }])).status).toBe(400);
    });

    it("cannot spend another user's wallet", async () => {
      const user = await registerUser();
      const rich = await registerUser();
      await verify(user.id, 'partner');
      const theirWallet = await creditWallet(rich.id, 1000);

      const res = await user.post(EXCHANGE, {
        payment_gateway_type: 'alipay',
        alipay_account_id: 1,
        amount_split: [{ wallet_id: theirWallet, amount: 500, use_credit_amount: 500 }],
      });
      expect(res.status).toBe(400);
      expect((await rich.get(`${ODOO}/partner/me`)).body.data.yuan_balance).toBe(1000);
    });

    it('validates the order', async () => {
      const user = await registerUser();
      await verify(user.id, 'partner');

      expect((await user.post(EXCHANGE, { ...BANK, amount: 0 })).status).toBe(400);
      expect((await user.post(EXCHANGE, { ...BANK, amount: 'abc' })).status).toBe(400);
      expect((await user.post(EXCHANGE, { ...BANK, account_name: undefined })).status).toBe(400);
      expect(
        (await user.post(EXCHANGE, { payment_gateway_type: 'bank', amount: 10, account_type: 'img' })).status,
      ).toBe(400);
      expect((await user.post(EXCHANGE, { payment_gateway_type: 'cash', amount: 10 })).status).toBe(400);
      expect(
        (
          await user.post(EXCHANGE, {
            payment_gateway_type: 'alipay',
            alipay_account_id: 99,
            amount_split: [{ wallet_id: 1, amount: 1 }],
          })
        ).status,
      ).toBe(400);
    });
  });
});
