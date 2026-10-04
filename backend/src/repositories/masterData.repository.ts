import pool from '../database';
import { NamedRef } from '../types/common.types';
import { Queryable } from '../types/database.types';
import {
  AlipayAccount,
  CurrencyRate,
  DescribedItem,
  LocalDelivery,
  ProductType,
  StockLocation,
} from '../types/masterData.types';

export class MasterDataRepository {
  async deliveryTypes(db: Queryable = pool): Promise<DescribedItem[]> {
    const { rows } = await db.query<DescribedItem>(
      'SELECT id, name, description FROM delivery_types ORDER BY id',
    );
    return rows;
  }

  async deliveryTypeExists(id: number, db: Queryable = pool): Promise<boolean> {
    const { rows } = await db.query('SELECT 1 FROM delivery_types WHERE id = $1', [id]);
    return rows.length > 0;
  }

  async productTypes(db: Queryable = pool): Promise<ProductType[]> {
    const { rows } = await db.query<ProductType>(
      `SELECT pt.id, pt.name, pt.description,
              COALESCE((
                SELECT json_agg(json_build_object('id', dt.id, 'name', dt.name, 'description', dt.description)
                                ORDER BY dt.id)
                FROM product_type_delivery_types link
                JOIN delivery_types dt ON dt.id = link.delivery_type_id
                WHERE link.product_type_id = pt.id
              ), '[]'::json) AS delivery_type
       FROM product_types pt ORDER BY pt.id`,
    );
    return rows;
  }

  async stockPickingTypes(db: Queryable = pool): Promise<NamedRef[]> {
    const { rows } = await db.query<NamedRef>('SELECT id, name FROM stock_picking_types ORDER BY id');
    return rows;
  }

  async stockLocations(db: Queryable = pool): Promise<StockLocation[]> {
    const { rows } = await db.query<StockLocation>(
      'SELECT id, display_name FROM stock_locations ORDER BY id',
    );
    return rows;
  }

  async shopTypes(db: Queryable = pool): Promise<DescribedItem[]> {
    const { rows } = await db.query<DescribedItem>(
      'SELECT id, name, description FROM shop_types ORDER BY id',
    );
    return rows;
  }

  async thaiCarriers(db: Queryable = pool): Promise<NamedRef[]> {
    const { rows } = await db.query<NamedRef>('SELECT id, name FROM thai_carriers ORDER BY sequence, id');
    return rows;
  }

  async carrierExists(id: number, db: Queryable = pool): Promise<boolean> {
    const { rows } = await db.query('SELECT 1 FROM thai_carriers WHERE id = $1', [id]);
    return rows.length > 0;
  }

  async localDeliveries(db: Queryable = pool): Promise<LocalDelivery[]> {
    const { rows } = await db.query<LocalDelivery>(
      'SELECT id, name, province_codes, sub_district_codes FROM local_deliveries ORDER BY id',
    );
    return rows;
  }

  async findLocalDelivery(id: number, db: Queryable = pool): Promise<LocalDelivery | null> {
    const { rows } = await db.query<LocalDelivery>(
      'SELECT id, name, province_codes, sub_district_codes FROM local_deliveries WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  }

  async alipayAccounts(db: Queryable = pool): Promise<AlipayAccount[]> {
    const { rows } = await db.query<AlipayAccount>(
      'SELECT id, name, note, active FROM alipay_accounts WHERE active ORDER BY id',
    );
    return rows;
  }

  async alipayAccountActive(id: number, db: Queryable = pool): Promise<boolean> {
    const { rows } = await db.query('SELECT 1 FROM alipay_accounts WHERE id = $1 AND active', [id]);
    return rows.length > 0;
  }

  async currency(service: string, db: Queryable = pool): Promise<CurrencyRate | null> {
    const { rows } = await db.query('SELECT * FROM currency_rates WHERE service = $1', [service]);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id as number,
      name: row.name as string,
      rate: row.rate as number,
      isOnline: Boolean(row.is_online),
      createdAt: row.created_at as Date,
      modifiedAt: row.modified_at as Date,
    };
  }
}
