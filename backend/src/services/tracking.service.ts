import { withTransaction } from '../database';
import { RegisterTrackingInput, UpdateTrackingInput } from '../schemas/tracking.schema';
import { DEFAULT_DELIVERY_TYPE_ID } from '../types/masterData.types';
import { Paged, PageRequest } from '../types/pagination.types';
import { TrackingServiceDeps } from '../types/service.types';
import { ChinaTracking, Lot, LotRow, ToConfirmRecord, TrackingDetail } from '../types/tracking.types';
import { AppError, notFound } from '../utils/errors';
import { paged } from '../utils/pagination';

const DUPLICATE_SERIAL = 'That tracking number is already registered';

function toLot(row: LotRow): Lot {
  return {
    id: row.id,
    lot_id: row.id,
    serial_number: row.serial_number,
    shopping_serial: row.shopping_serial,
    shipping_lot: row.shipping_lot,
    shipping_lot_display: row.shipping_lot
      ? { name: row.shipping_lot, shipping_lot_sequence: row.shipping_lot_sequence }
      : null,
    po_number: row.po_number,
    packing_type: row.packing_type,
    quantity: row.quantity,
    total_amount: row.quantity,
    weight: row.weight,
    width: row.width,
    depth: row.depth,
    height: row.height,
    volume: row.volume,
    total_weight: row.total_weight,
    total_volume: row.total_volume,
    delivery_cost: row.delivery_cost,
    packing_cost: row.packing_cost,
    qc_cost: row.qc_cost,
    extra_cost: row.extra_cost,
    other_cost: row.other_cost,
    th_other_cost: row.th_other_cost,
    storage_cost: row.storage_cost,
    total_cost: row.total_cost,
    counting_note: row.counting_note,
    remarks: row.remarks,
    current_location: { id: row.current_location_id, name: row.location_name },
    delivery_date: {
      cn_checkin: row.cn_checkin,
      cn_checkout: row.cn_checkout,
      th_expected_checkin: row.th_expected_checkin,
      th_checkin: row.th_checkin,
      th_checkout: row.th_checkout,
    },
    // The parcel list reads the totals from the first child, so a lot always carries exactly one
    child_ids: [
      {
        id: row.id,
        weight: row.total_weight,
        height: row.height,
        width: row.width,
        depth: row.depth,
        volume: row.total_volume,
        weight_per_item: row.weight,
        product_type: row.product_type_id,
      },
    ],
    po_image_ids: [],
    image_ids: row.product_image ? [row.product_image] : [],
    qc_image_ids: [],
  };
}

function toConfirmRecord(row: LotRow): ToConfirmRecord {
  const {
    child_ids: _children,
    image_ids: _images,
    po_image_ids: _po,
    qc_image_ids: _qc,
    ...lot
  } = toLot(row);
  const images = row.product_image ? [{ url: row.product_image }] : [];
  return {
    ...lot,
    parent_id: null,
    weight_per_item: row.weight,
    shopping_serial_original: row.shopping_serial,
    shopping_serial_max_sequence: row.quantity,
    prefer_price: 'weight',
    price: row.delivery_cost,
    cost_price: 0,
    selling_price: 0,
    selling_price_unit: 0,
    base_cost: 0,
    base_profit: 0,
    affiliate_cost: 0,
    affiliate_profit: 0,
    affiliate_commission: 0,
    po_image_ids: [],
    product_image_ids: images,
    normal_image_ids: images,
    qc_image_ids: [],
    product_image: row.product_image,
    note: row.note,
  };
}

export function createTrackingService({
  trackings,
  lots,
  masterData,
  uploads,
  notifications,
}: TrackingServiceDeps) {
  async function requireDeliveryTypes(ids: Iterable<number>): Promise<void> {
    for (const id of new Set(ids)) {
      if (!(await masterData.deliveryTypeExists(id))) {
        throw new AppError(`delivery_type_id ${id} does not exist`, 400, 'invalid_request');
      }
    }
  }

  return {
    listDetails(userId: number, readyOnly: boolean, page: PageRequest): Promise<Paged<TrackingDetail>> {
      return paged(
        page,
        async () =>
          (await trackings.listDetails(userId, readyOnly, page)).map(({ tracking, lot }) => ({
            china_tracking: tracking,
            lot: lot ? toLot(lot) : null,
          })),
        () => trackings.count(userId, readyOnly),
      );
    },

    list(userId: number, page: PageRequest): Promise<Paged<ChinaTracking>> {
      return paged(
        page,
        async () => (await trackings.listDetails(userId, false, page)).map(({ tracking }) => tracking),
        () => trackings.count(userId, false),
      );
    },

    exists(serials: string[]): Promise<boolean> {
      return trackings.existsAny(serials);
    },

    async register(userId: number, input: RegisterTrackingInput): Promise<ChinaTracking[]> {
      const items = input.china_tracking_ids;

      const serials = items.map((item) => item.shopping_serial.toUpperCase());
      if (new Set(serials).size !== serials.length) {
        throw new AppError('A tracking number is listed more than once.', 400, 'invalid_request');
      }
      if (await trackings.existsAny(serials)) throw new AppError(DUPLICATE_SERIAL, 409, 'conflict');
      await requireDeliveryTypes(items.map((item) => item.delivery_type_id));

      const created = await withTransaction(async (tx) => {
        const saved: ChinaTracking[] = [];
        for (const item of items) {
          saved.push(
            await trackings.create(
              userId,
              {
                shoppingSerial: item.shopping_serial,
                deliveryTypeId: item.delivery_type_id,
                shippingWithBox: item.shipping_with_box,
                qc: item.qc,
                requiredPicture: item.required_picture,
                remarks: item.remark,
              },
              null,
              tx,
            ),
          );
        }
        return saved;
      });

      notifications.notifyQuietly(userId, {
        title: 'สร้างรายการติดตามพัสดุ',
        message: `ลงทะเบียนเลขพัสดุ ${created.length} รายการเรียบร้อยแล้ว รอโกดังจีนรับเข้าพัสดุ`,
        link: '/web/created-parcel-list',
        linkText: 'ดูรายการ',
      });
      return created;
    },

    async update(userId: number, input: UpdateTrackingInput): Promise<void> {
      const items = input.china_tracking_ids;
      await requireDeliveryTypes(items.flatMap((item) => item.delivery_type_id ?? []));

      await withTransaction(async (tx) => {
        for (const item of items) {
          const updated = await trackings.updatePending(
            userId,
            {
              id: item.id,
              deliveryTypeId: item.delivery_type_id,
              shippingWithBox: item.shipping_with_box,
              qc: item.qc,
              requiredPicture: item.required_picture,
              remarks: item.remark === undefined ? undefined : (item.remark ?? ''),
            },
            tx,
          );
          if (!updated) {
            throw new AppError(
              `Parcel ${item.id} was not found or has already been received`,
              404,
              'not_found',
            );
          }
        }
      });
    },

    listToConfirm(userId: number, page: PageRequest): Promise<Paged<ToConfirmRecord>> {
      return paged(
        page,
        async () => (await lots.listToConfirm(userId, page)).map(toConfirmRecord),
        () => lots.countToConfirm(userId),
      );
    },

    async submitToConfirm(userId: number, lotId: number, poImageUrl: string): Promise<void> {
      const proof = await uploads.resolveOwned(userId, poImageUrl);

      const serial = await withTransaction(async (tx) => {
        const lot = await lots.lockPendingForUser(lotId, userId, tx);
        if (!lot) throw notFound('Parcel');

        const existing = await trackings.findBySerial(lot.shopping_serial, tx);
        if (existing && (existing.user !== userId || existing.lot_id !== null)) {
          throw new AppError(DUPLICATE_SERIAL, 409, 'conflict');
        }

        if (existing) {
          await trackings.attachLot(existing.id, lot.id, tx);
        } else {
          await trackings.create(
            userId,
            {
              shoppingSerial: lot.shopping_serial,
              deliveryTypeId: DEFAULT_DELIVERY_TYPE_ID,
              shippingWithBox: lot.packing_type,
              qc: lot.qc_cost > 0,
              requiredPicture: false,
              remarks: lot.note,
            },
            lot.id,
            tx,
          );
        }
        await lots.markSubmitted(lot.id, proof.id, tx);
        return lot.shopping_serial;
      });

      notifications.notifyQuietly(userId, {
        title: 'ยืนยันเจ้าของพัสดุ',
        message: `ได้รับหลักฐานการสั่งซื้อของพัสดุ ${serial} แล้ว`,
        link: '/web/parcel-list',
        linkText: 'ดูรายการพัสดุ',
      });
    },
  };
}

export type TrackingService = ReturnType<typeof createTrackingService>;
