import { Queryable } from '../types/database.types';
import { LOCAL_DELIVERIES } from './localDeliveries';

// These ids are part of the contract with the frontend, which hardcodes several of them:
// delivery type 1 is the default of a new parcel, carrier 2 is "private express" (the only one
// that shows the local carrier list, and it must be listed first), Alipay account 1 is preselected,
// and the three stock location names are matched literally to show a parcel's status.
const DELIVERY_TYPES = [
  { id: 1, name: 'EK', description: 'ทางรถ' },
  { id: 2, name: 'SEA', description: 'ทางเรือ' },
];

const PRODUCT_TYPES = [
  { id: 1, name: 'P', description: 'ทั่วไป (รถ)', deliveryTypes: [1] },
  { id: 2, name: 'D', description: 'มอก. (รถ)', deliveryTypes: [1] },
  { id: 3, name: 'HY', description: 'อย.', deliveryTypes: [1] },
  { id: 4, name: 'M', description: 'แบรนด์/ลิขสิทธิ์', deliveryTypes: [1] },
  { id: 5, name: 'SP', description: 'ทั่วไป (เรือ)', deliveryTypes: [2] },
  { id: 6, name: 'SD', description: 'มอก. (เรือ)', deliveryTypes: [2] },
];

const STOCK_PICKING_TYPES = [
  { id: 1, name: 'CN Warehouse: Receipts' },
  { id: 2, name: 'CN Warehouse: Delivery Orders' },
  { id: 3, name: 'TH Warehouse: Receipts' },
  { id: 4, name: 'TH Warehouse: Delivery Orders' },
];

const STOCK_LOCATIONS = [
  { id: 1, display_name: 'CN-WH/Stock' },
  { id: 2, display_name: 'Transit' },
  { id: 3, display_name: 'TH-WH/Stock' },
  { id: 4, display_name: 'Partner Locations/Customers' },
];

const SHOP_TYPES = [
  { id: 1, name: 'Taobao', description: 'taobao.com' },
  { id: 2, name: 'Tmall', description: 'tmall.com' },
  { id: 3, name: '1688', description: '1688.com' },
  { id: 4, name: 'JD', description: 'jd.com' },
  { id: 5, name: 'Pinduoduo', description: 'pinduoduo.com' },
  { id: 6, name: 'Other', description: 'ร้านค้าอื่นๆ' },
];

const THAI_CARRIERS = [
  { id: 2, name: 'ขนส่งเอกชน', sequence: 1 },
  { id: 1, name: 'รับเองที่โกดัง', sequence: 2 },
  { id: 3, name: 'รถบริษัท (กรุงเทพฯ และปริมณฑล)', sequence: 3 },
];

const ALIPAY_ACCOUNTS = [
  { id: 1, name: 'BTC Alipay 01', note: 'บัญชีหลัก' },
  { id: 2, name: 'BTC Alipay 02', note: 'บัญชีสำรอง' },
];

const CURRENCY_RATES = [{ service: 'payment', name: 'CNY', rate: 5.02 }];

export async function seedMasterData(db: Queryable): Promise<void> {
  for (const item of DELIVERY_TYPES) {
    await db.query(
      `INSERT INTO delivery_types (id, name, description) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [item.id, item.name, item.description],
    );
  }

  for (const item of PRODUCT_TYPES) {
    await db.query(
      `INSERT INTO product_types (id, name, description) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [item.id, item.name, item.description],
    );
    for (const deliveryTypeId of item.deliveryTypes) {
      await db.query(
        `INSERT INTO product_type_delivery_types (product_type_id, delivery_type_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [item.id, deliveryTypeId],
      );
    }
  }

  for (const item of STOCK_PICKING_TYPES) {
    await db.query(
      `INSERT INTO stock_picking_types (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
      [item.id, item.name],
    );
  }

  for (const item of STOCK_LOCATIONS) {
    await db.query(
      `INSERT INTO stock_locations (id, display_name) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name`,
      [item.id, item.display_name],
    );
  }

  for (const item of SHOP_TYPES) {
    await db.query(
      `INSERT INTO shop_types (id, name, description) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [item.id, item.name, item.description],
    );
  }

  for (const item of THAI_CARRIERS) {
    await db.query(
      `INSERT INTO thai_carriers (id, name, sequence) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sequence = EXCLUDED.sequence`,
      [item.id, item.name, item.sequence],
    );
  }

  for (const item of LOCAL_DELIVERIES) {
    await db.query(
      `INSERT INTO local_deliveries (id, name, province_codes, sub_district_codes) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, province_codes = EXCLUDED.province_codes,
         sub_district_codes = EXCLUDED.sub_district_codes`,
      [item.id, item.name, item.provinceCodes, item.subDistrictCodes],
    );
  }

  for (const item of ALIPAY_ACCOUNTS) {
    await db.query(
      `INSERT INTO alipay_accounts (id, name, note) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, note = EXCLUDED.note`,
      [item.id, item.name, item.note],
    );
  }

  for (const item of CURRENCY_RATES) {
    await db.query(
      `INSERT INTO currency_rates (service, name, rate) VALUES ($1, $2, $3)
       ON CONFLICT (service) DO NOTHING`,
      [item.service, item.name, item.rate],
    );
  }
}
