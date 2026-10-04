import pool from '../database';
import { Product } from '../types/content.types';
import { Queryable } from '../types/database.types';

const PRICE = "'FM999999990.00'";

export class ProductRepository {
  async listActive(db: Queryable = pool): Promise<Product[]> {
    const { rows } = await db.query<Product>(
      `SELECT p.id, p.name, p.description, to_char(p.price, ${PRICE}) AS price,
              p.is_active, p.is_simple, p.has_stock, p.shop_id AS shop, s.name AS shop_name,
              COALESCE((
                SELECT json_agg(json_build_object(
                         'id', v.id, 'display_name', v.display_name, 'key', v.key,
                         'is_active', v.is_active, 'has_stock', v.has_stock,
                         'price', to_char(v.price, ${PRICE}), 'product', v.product_id
                       ) ORDER BY v.id)
                FROM product_variants v WHERE v.product_id = p.id AND v.is_active
              ), '[]'::json) AS variants,
              COALESCE((
                SELECT json_agg(json_build_object(
                         'id', u.id, 'file', u.file, 'type', u.type, 'product', u.product_id
                       ) ORDER BY u.id)
                FROM product_uploads u WHERE u.product_id = p.id
              ), '[]'::json) AS uploads
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       WHERE p.is_active
       ORDER BY p.id ASC`,
    );
    return rows;
  }
}
