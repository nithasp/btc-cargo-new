import { LOCATION } from '../../types/masterData.types';
import { TestUser } from '../../types/test.types';
import {
  api,
  createLot,
  DELIVERY,
  ensureReferenceData,
  ODOO,
  registerUser,
  uniqueName,
} from '../support/api';

const TRACKING = `${ODOO}/sale/china/tracking`;

describe('Parcels and transport bills', () => {
  let user: TestUser;
  let other: TestUser;

  beforeAll(async () => {
    await ensureReferenceData();
    user = await registerUser();
    other = await registerUser();
  });

  describe('registering tracking numbers', () => {
    it('registers parcels, then reports them as existing whatever the letter case', async () => {
      const serial = uniqueName('yt').toUpperCase();

      const before = await user.post(`${TRACKING}/check`, { serial_list: [serial] });
      expect(before.body.data.exist).toBe(false);

      const created = await user.post(`${TRACKING}/register`, {
        china_tracking_ids: [
          {
            shopping_serial: serial,
            delivery_type_id: 1,
            shipping_with_box: 'solid',
            qc: true,
            required_picture: true,
            remark: null,
          },
        ],
      });
      expect(created.status).toBe(201);
      expect(created.body.success).toBe(true);
      expect(created.body.data[0].shipping_with_box).toBe('solid');
      expect(created.body.data[0].lot_id).toBeNull();

      const after = await other.post(`${TRACKING}/check`, { serial_list: [serial.toLowerCase()] });
      expect(after.body.data.exist).toBe(true);

      const duplicate = await other.post(`${TRACKING}/register`, {
        china_tracking_ids: [{ shopping_serial: serial, delivery_type_id: 1 }],
      });
      expect(duplicate.status).toBe(409);
      expect(typeof duplicate.body.message).toBe('string');
    });

    it('rejects a repeated number, an unknown delivery type and an empty list', async () => {
      const serial = uniqueName('dup');
      const repeated = await user.post(`${TRACKING}/register`, {
        china_tracking_ids: [
          { shopping_serial: serial, delivery_type_id: 1 },
          { shopping_serial: serial.toUpperCase(), delivery_type_id: 1 },
        ],
      });
      expect(repeated.status).toBe(400);

      const unknown = await user.post(`${TRACKING}/register`, {
        china_tracking_ids: [{ shopping_serial: uniqueName('x'), delivery_type_id: 999 }],
      });
      expect(unknown.status).toBe(400);

      expect((await user.post(`${TRACKING}/register`, { china_tracking_ids: [] })).status).toBe(400);
    });

    it('lets the owner edit a parcel only until the warehouse receives it', async () => {
      const serial = uniqueName('edit');
      const created = await user.post(`${TRACKING}/register`, {
        china_tracking_ids: [{ shopping_serial: serial, delivery_type_id: 1 }],
      });
      const id = created.body.data[0].id as number;

      await user
        .post(`${TRACKING}/update`, { china_tracking_ids: [{ id, qc: true, remark: 'fragile' }] })
        .expect(200);
      expect(
        (await other.post(`${TRACKING}/update`, { china_tracking_ids: [{ id, qc: false }] })).status,
      ).toBe(404);

      const list = await user.get(`${TRACKING}/list?page=1&pageSize=50`);
      const saved = list.body.data.records.find((record: { id: number }) => record.id === id);
      expect(saved.qc).toBe(true);
      expect(saved.remarks).toBe('fragile');
    });
  });

  describe('GET /sale/china/tracking', () => {
    it("lists only the caller's parcels, with numeric lot values and a pagination block", async () => {
      const owner = await registerUser();
      await createLot(owner.id);
      await owner.post(`${TRACKING}/register`, {
        china_tracking_ids: [{ shopping_serial: uniqueName('new'), delivery_type_id: 1 }],
      });

      const res = await owner.get(`${TRACKING}?page=1&pageSize=10`);
      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toEqual({
        page: 1,
        pageSize: 10,
        startPage: 1,
        endPage: 1,
        records: 2,
      });

      const [registered, received] = res.body.data.records;
      expect(registered.lot).toBeNull();
      expect(received.lot.total_volume).toBe(0.048);
      expect(received.lot.delivery_cost).toBe(250);
      expect(received.lot.child_ids.length).toBe(1);
      expect(received.lot.current_location.id).toBe(LOCATION.TH_WAREHOUSE);
      expect(received.china_tracking.is_ready).toBe(true);

      const ready = await owner.get(`${TRACKING}?page=1&pageSize=10&is_ready=true`);
      expect(ready.body.data.records.length).toBe(1);
      expect(ready.body.data.records[0].lot.id).toBe(received.lot.id);

      const stranger = await other.get(`${TRACKING}?page=1&pageSize=10&is_ready=true`);
      expect(
        stranger.body.data.records.some((r: { lot: { id: number } }) => r.lot.id === received.lot.id),
      ).toBe(false);
    });

    it('validates paging and needs a token', async () => {
      expect((await user.get(`${TRACKING}?page=0`)).status).toBe(400);
      expect((await user.get(`${TRACKING}?pageSize=1000`)).status).toBe(400);
      expect((await api.get(TRACKING)).status).toBe(401);
    });
  });

  describe('POST /sale/quotation', () => {
    const quotation = (lotIds: number[], extra: object = {}) => ({
      carrier_id: 2,
      local_delivery_id: 1,
      delivery_address: DELIVERY,
      invoice_address: { ...DELIVERY, vat: '', is_juristic: false },
      china_tracking_ids: lotIds,
      ...extra,
    });

    it('bills the selected parcels at the amounts stored on the server', async () => {
      const owner = await registerUser();
      const first = await createLot(owner.id);
      const second = await createLot(owner.id);

      const res = await owner.post(`${ODOO}/sale/quotation`, {
        ...quotation([first.lotId, second.lotId]),
        total_cost: 1,
        amount: 1,
      });
      expect(res.status).toBe(201);

      const bill = await owner.get(`${ODOO}/payment_gateway/${res.body.data.payment_gateway_id}`);
      expect(bill.body.data.state).toBe('wait');
      expect(bill.body.data.service_type).toBe('delivery');
      expect(bill.body.data.amount_currency).toBe(first.total + second.total);
      expect(bill.body.data.quantity_with_symbol).toBe('4 ชิ้น');
      expect(bill.body.data.create_date).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

      const again = await owner.post(`${ODOO}/sale/quotation`, quotation([first.lotId]));
      expect(again.status).toBe(400);

      const ready = await owner.get(`${TRACKING}?is_ready=true`);
      expect(ready.body.data.records.length).toBe(0);
    });

    it("refuses parcels that are someone else's, not in Thailand yet, or awaiting an owner", async () => {
      const owner = await registerUser();
      const mine = await createLot(owner.id);
      const inTransit = await createLot(owner.id, { location: LOCATION.TRANSIT });
      const unclaimed = await createLot(owner.id, { pending: true });
      const theirs = await createLot(other.id);

      for (const lotId of [inTransit.lotId, unclaimed.lotId, theirs.lotId]) {
        const res = await owner.post(`${ODOO}/sale/quotation`, quotation([mine.lotId, lotId]));
        expect(res.status).toBe(400);
      }

      const stillReady = await owner.get(`${TRACKING}?is_ready=true`);
      expect(stillReady.body.data.records.length).toBe(1);
    });

    it('requires a local carrier for private express and validates the carrier', async () => {
      const owner = await registerUser();
      const lot = await createLot(owner.id);

      expect(
        (await owner.post(`${ODOO}/sale/quotation`, quotation([lot.lotId], { local_delivery_id: null })))
          .status,
      ).toBe(400);
      expect(
        (await owner.post(`${ODOO}/sale/quotation`, quotation([lot.lotId], { carrier_id: 99 }))).status,
      ).toBe(400);
      expect(
        (
          await owner.post(
            `${ODOO}/sale/quotation`,
            quotation([lot.lotId], { carrier_id: 1, local_delivery_id: null }),
          )
        ).status,
      ).toBe(201);
    });
  });

  describe('paying a bill', () => {
    it('takes one payment report per bill, with a slip the payer uploaded', async () => {
      const owner = await registerUser();
      const lot = await createLot(owner.id);
      const created = await owner.post(`${ODOO}/sale/quotation`, {
        carrier_id: 1,
        delivery_address: DELIVERY,
        invoice_address: DELIVERY,
        china_tracking_ids: [lot.lotId],
      });
      const billId = created.body.data.payment_gateway_id as number;

      const slip = await owner.upload('payment').expect(201);
      const foreignSlip = await other.upload('payment').expect(201);

      const stolen = await owner.post(`${ODOO}/payment/create`, {
        payment_gateway_id: billId,
        amount: 300,
        image_ids: [{ url: foreignSlip.body.data.url, status: 1 }],
      });
      expect(stolen.status).toBe(400);

      expect(
        (await other.post(`${ODOO}/payment/create`, { payment_gateway_id: billId, amount: 300 })).status,
      ).toBe(404);
      expect(
        (await owner.post(`${ODOO}/payment/create`, { payment_gateway_id: billId, amount: 0 })).status,
      ).toBe(400);

      const paid = await owner.post(`${ODOO}/payment/create`, {
        payment_gateway_id: billId,
        amount: 300,
        payment_date_time: '2026-10-03 06:30:00',
        image_ids: [{ url: `http://localhost:3000${slip.body.data.url}`, status: 1 }],
      });
      expect(paid.status).toBe(201);

      const bill = await owner.get(`${ODOO}/payment_gateway/${billId}`);
      expect(bill.body.data.state).toBe('paid');

      expect(
        (await owner.post(`${ODOO}/payment/create`, { payment_gateway_id: billId, amount: 300 })).status,
      ).toBe(409);
    });

    it("answers 200 with null data for a bill that is not the caller's or does not exist", async () => {
      const owner = await registerUser();
      const lot = await createLot(owner.id);
      const created = await owner.post(`${ODOO}/sale/quotation`, {
        carrier_id: 1,
        delivery_address: DELIVERY,
        invoice_address: DELIVERY,
        china_tracking_ids: [lot.lotId],
      });

      for (const path of [
        `${ODOO}/payment_gateway/${created.body.data.payment_gateway_id}`,
        `${ODOO}/payment_gateway/NaN`,
      ]) {
        const res = await other.get(path);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
        expect(res.body.data).toBeNull();
      }
    });
  });

  describe('parcels waiting for their owner', () => {
    it('are claimed with proof of purchase and then become ordinary parcels', async () => {
      const owner = await registerUser();
      const lot = await createLot(owner.id, { pending: true });

      const listed = await owner.get(`${ODOO}/to/confirm?page=1&pageSize=10`);
      expect(listed.body.data.records.length).toBe(1);
      expect(listed.body.data.records[0].lot_id).toBe(lot.lotId);

      const proof = await owner.upload('confirm-image').expect(201);
      const foreignProof = await other.upload('confirm-image').expect(201);

      expect(
        (
          await owner.post(`${ODOO}/to/confirm/submit`, {
            lot_id: lot.lotId,
            po_image: foreignProof.body.data.url,
          })
        ).status,
      ).toBe(400);
      expect(
        (
          await other.post(`${ODOO}/to/confirm/submit`, {
            lot_id: lot.lotId,
            po_image: foreignProof.body.data.url,
          })
        ).status,
      ).toBe(404);

      await owner
        .post(`${ODOO}/to/confirm/submit`, { lot_id: lot.lotId, po_image: proof.body.data.url })
        .expect(200);

      expect((await owner.get(`${ODOO}/to/confirm`)).body.data.records.length).toBe(0);
      const parcels = await owner.get(`${TRACKING}?is_ready=true`);
      expect(parcels.body.data.records[0].lot.id).toBe(lot.lotId);

      expect(
        (await owner.post(`${ODOO}/to/confirm/submit`, { lot_id: lot.lotId, po_image: proof.body.data.url }))
          .status,
      ).toBe(404);
    });
  });
});
