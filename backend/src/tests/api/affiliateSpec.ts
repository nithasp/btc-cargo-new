import { TestUser } from '../../types/test.types';
import {
  api,
  createLot,
  DELIVERY,
  ensureReferenceData,
  ODOO,
  registerUser,
  uniqueName,
  verify,
} from '../support/api';

const PRICES = { p: 30, d: 45, hy: 75, m: 190, sp: 24, sd: 40 };
const VOLUMES = { p: 6500, d: 7500, hy: 11000, m: 19000, sp: 4200, sd: 6300 };

const member = (code: string, extra: object = {}) => ({
  affiliate_code: code,
  name: 'Agent',
  email: 'agent@mail.test',
  commission_type: 'cost',
  referral_code: 'RBTCXA11',
  commission_rate: 1,
  btc_code: '',
  vat: '',
  selling_id: { id: null, weight_price: PRICES, volume_price: VOLUMES },
  affiliate_address: { phone_number: '0800000000', line1: '1 Road', line2: '104101' },
  ...extra,
});

describe('Affiliate', () => {
  let agent: TestUser;
  let customer: TestUser;
  let memberCode: string;

  beforeAll(async () => {
    await ensureReferenceData();
    agent = await registerUser();
    await verify(agent.id, 'affiliate');

    memberCode = uniqueName('AG').toUpperCase();
    await agent.post(`${ODOO}/affiliate/manage`, member(memberCode)).expect(200);
    customer = await registerUser(memberCode.toLowerCase());
  });

  describe('verification', () => {
    it('gates every agent route until the affiliate is verified', async () => {
      const user = await registerUser();

      const me = await user.get(`${ODOO}/affiliate/me`);
      expect(me.body.data).toEqual({ type: 'customer', verification_state: 'unverified', team_id: null });

      for (const path of ['/affiliate/team', '/sale/summary']) {
        const res = await user.get(`${ODOO}${path}`);
        expect(res.status).toBe(403);
        expect(typeof res.body.message).toBe('string');
      }
      expect((await user.post(`${ODOO}/affiliate/manage`, member(uniqueName('X')))).status).toBe(403);
      expect((await user.get('/api/report/aff_report_1/')).status).toBe(403);
    });

    it('takes an ID card and a contract the user uploaded', async () => {
      const user = await registerUser();
      const idCard = await user.upload('payment').expect(201);
      const contract = await user.upload('payment').expect(201);

      const res = await user.post(`${ODOO}/affiliate/create_verification`, {
        upload_url: idCard.body.data.url,
        consent_url: contract.body.data.url,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.images.length).toBe(2);
      expect((await user.get(`${ODOO}/affiliate/me`)).body.data.verification_state).toBe('reviewing');
    });
  });

  describe('team', () => {
    it('is created with the standard rates the first time a verified affiliate asks', async () => {
      const me = await agent.get(`${ODOO}/affiliate/me`);
      expect(me.body.data.type).toBe('agent');
      expect(me.body.data.team_id).toBeGreaterThan(0);

      const team = await agent.get(`${ODOO}/affiliate/team`);
      expect(team.body.data.team_setting.costing_id.weight_price.p).toBe(25);
      expect(team.body.data.team_setting.costing_id.volume_price.sd).toBe(6000);
      const saved = team.body.data.team_members.find(
        (item: { affiliate_code: string }) => item.affiliate_code === memberCode,
      );
      expect(saved.selling_id.weight_price).toEqual(PRICES);
      expect(saved.selling_id.volume_price).toEqual(VOLUMES);
      expect(saved.affiliate_address.line2).toBe('104101');
      expect(saved.costing_id.weight_price.p).toBe(25);
    });

    it('answers an incomplete form with 200 and success false', async () => {
      const res = await agent.post(`${ODOO}/affiliate/manage`, {
        affiliate_code: '',
        selling_id: { weight_price: { p: null }, volume_price: {} },
        affiliate_address: {},
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(typeof res.body.message).toBe('string');

      const email = await agent.post(`${ODOO}/affiliate/manage`, member(uniqueName('E'), { email: 'nope' }));
      expect(email.body.success).toBe(false);
      expect(email.body.message).toContain('email');
    });

    it('updates its own member, keeps codes unique and cannot touch another team', async () => {
      const code = uniqueName('UP').toUpperCase();
      const created = await agent.post(`${ODOO}/affiliate/manage`, member(code)).expect(200);
      const saved = { id: created.body.data.id as number };

      const updated = await agent.post(
        `${ODOO}/affiliate/manage`,
        member(code, {
          id: saved.id,
          name: 'Renamed',
          selling_id: { weight_price: { ...PRICES, p: 33 }, volume_price: VOLUMES },
        }),
      );
      expect(updated.body.success).toBe(true);

      const members = (await agent.get(`${ODOO}/affiliate/team`)).body.data.team_members;
      const after = members.find((item: { id: number }) => item.id === saved.id);
      expect(after.name).toBe('Renamed');
      expect(after.selling_id.weight_price.p).toBe(33);

      const rival = await registerUser();
      await verify(rival.id, 'affiliate');
      expect((await rival.post(`${ODOO}/affiliate/manage`, member(memberCode))).status).toBe(409);
      expect(
        (await rival.post(`${ODOO}/affiliate/manage`, member(uniqueName('R'), { id: saved.id }))).status,
      ).toBe(404);
    });
  });

  describe('referred orders', () => {
    let orderId: number;

    beforeAll(async () => {
      const lot = await createLot(customer.id);
      await customer
        .post(`${ODOO}/sale/quotation`, {
          carrier_id: 1,
          delivery_address: DELIVERY,
          invoice_address: DELIVERY,
          china_tracking_ids: [lot.lotId],
        })
        .expect(201);

      const summary = await agent.get(`${ODOO}/sale/summary?page=1&pageSize=10`);
      orderId = summary.body.data.records[0].id as number;
    });

    it("show up in the agent's summary with a commission", async () => {
      const summary = await agent.get(`${ODOO}/sale/summary?page=1&pageSize=10`);
      const [order] = summary.body.data.records;

      expect(summary.body.data.pagination.records).toBe(1);
      expect(order.tracking_ids.length).toBe(1);
      expect(order.delivery_price.delivery_price).toBe(250);
      expect(order.delivery_price.total_cost).toBe(300);
      expect(order.affiliate_commission).toBe(12.5);
      expect(order.final_commission).toBe(order.affiliate_commission - order.discount_commission);
      expect(order.rate.cost_price).toBe(25);
    });

    it('take a discount up to the commission, from their own agent only', async () => {
      const discount = (who: TestUser, amount: number) =>
        who.post(`${ODOO}/sale/order/discount`, { sale_order_id: orderId, discount_amount: amount });

      expect((await discount(agent, 12.51)).status).toBe(400);
      expect((await discount(agent, -1)).status).toBe(400);
      expect((await discount(customer, 1)).status).toBe(403);

      const rival = await registerUser();
      await verify(rival.id, 'affiliate');
      expect((await discount(rival, 1)).status).toBe(404);

      await discount(agent, 2.5).expect(200);
      const [order] = (await agent.get(`${ODOO}/sale/summary`)).body.data.records;
      expect(order.discount_commission).toBe(2.5);
      expect(order.final_commission).toBe(10);
    });
  });

  describe('reports', () => {
    it('hands out a framed page for each report', async () => {
      for (const [name, type] of [
        ['aff_report_1', 'dashboard'],
        ['aff_report_2', 'question'],
        ['aff_goal_report', 'dashboard'],
      ]) {
        const link = await agent.get(`/api/report/${name}/`);
        expect(link.status).toBe(200);
        expect(link.body.data.report_type).toBe(type);

        const path = new URL(link.body.data.report_url as string).pathname;
        const page = await api.get(`${path}?start_date=2020-01-01&end_date=2020-02-01`);
        expect(page.status).toBe(200);
        expect(page.type).toBe('text/html');
        expect(page.headers['content-security-policy']).toContain('frame-ancestors http://localhost:4200');
        expect(page.headers['x-frame-options']).toBeUndefined();
      }
    });

    it('rejects an unknown report, a login token and a malformed date', async () => {
      expect((await agent.get('/api/report/secret_report/')).status).toBe(400);
      expect((await api.get(`/embed/dashboard/${agent.key}`)).status).toBe(401);

      const link = await agent.get('/api/report/aff_report_1/');
      const path = new URL(link.body.data.report_url as string).pathname;
      expect((await api.get(`${path}?start_date=2020-13-45`)).status).toBe(400);
    });
  });
});
