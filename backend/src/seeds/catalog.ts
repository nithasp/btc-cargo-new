import { Queryable } from '../types/database.types';
import { Rgb, ShopSeed } from '../types/seed.types';
import { requireRow } from '../utils/rows';
import { productTile } from './images';

const WHITE: Rgb = [206, 212, 218];
const GREY: Rgb = [108, 117, 125];
const BLACK: Rgb = [33, 37, 41];
const BLUE: Rgb = [94, 114, 228];
const PINK: Rgb = [243, 164, 181];
const GREEN: Rgb = [45, 206, 137];
const CREAM: Rgb = [222, 196, 156];
const ORANGE: Rgb = [251, 99, 64];
const TEAL: Rgb = [17, 205, 239];

const SHOPS: ShopSeed[] = [
  {
    name: 'BTC Home Living',
    products: [
      {
        name: 'กล่องเก็บของพับได้ 66 ลิตร',
        description: 'กล่องพลาสติกพับเก็บได้ มีฝาปิดและล้อเลื่อน เหมาะสำหรับจัดเก็บเสื้อผ้าและของใช้',
        price: 35.9,
        color: BLUE,
        variants: [
          { name: 'สีขาว', key: 'white', price: 35.9, color: WHITE },
          { name: 'สีเทา', key: 'grey', price: 35.9, color: GREY },
          { name: 'สีฟ้า', key: 'blue', price: 38.5, color: BLUE },
        ],
      },
      {
        name: 'โคมไฟตั้งโต๊ะ LED ปรับแสงได้ 3 ระดับ',
        description: 'โคมไฟถนอมสายตา ชาร์จ USB ปรับความสว่างและอุณหภูมิสีได้',
        price: 58,
        color: ORANGE,
      },
      {
        name: 'ชั้นวางของสแตนเลส 4 ชั้น',
        description: 'ชั้นวางของอเนกประสงค์ รับน้ำหนักได้ชั้นละ 30 กก.',
        price: 129,
        color: GREY,
        variants: [
          { name: 'กว้าง 60 ซม.', key: 'w60', price: 129, color: GREY },
          { name: 'กว้าง 80 ซม.', key: 'w80', price: 158, color: BLACK },
        ],
      },
    ],
  },
  {
    name: 'Guangzhou Gadget Hub',
    products: [
      {
        name: 'หูฟังบลูทูธไร้สาย TWS พร้อมกล่องชาร์จ',
        description: 'บลูทูธ 5.3 ตัดเสียงรบกวน ใช้งานต่อเนื่อง 6 ชั่วโมง',
        price: 79,
        color: BLACK,
        variants: [
          { name: 'สีดำ', key: 'black', price: 79, color: BLACK },
          { name: 'สีขาว', key: 'white', price: 79, color: WHITE },
        ],
      },
      {
        name: 'สายชาร์จ Type-C 1 เมตร (แพ็ก 5 เส้น)',
        description: 'สายถักไนลอน รองรับชาร์จเร็ว 3A',
        price: 18.5,
        color: TEAL,
      },
      {
        name: 'พาวเวอร์แบงก์ 20000mAh ชาร์จเร็ว 22.5W',
        description: 'จอ LED แสดงแบตเตอรี่ ชาร์จได้ 3 อุปกรณ์พร้อมกัน',
        price: 96,
        color: PINK,
        variants: [
          { name: 'สีดำ', key: 'black', price: 96, color: BLACK },
          { name: 'สีชมพู', key: 'pink', price: 99, color: PINK },
        ],
      },
    ],
  },
  {
    name: 'Yiwu Fashion Wholesale',
    products: [
      {
        name: 'กระเป๋าผ้าแคนวาสสะพายข้าง',
        description: 'ผ้าแคนวาสหนา 12 ออนซ์ มีซิปและช่องใส่ของด้านใน',
        price: 12.8,
        color: CREAM,
        variants: [
          { name: 'สีครีม', key: 'cream', price: 12.8, color: CREAM },
          { name: 'สีดำ', key: 'black', price: 12.8, color: BLACK },
          { name: 'สีเขียว', key: 'green', price: 13.5, color: GREEN },
        ],
      },
      {
        name: 'หมวกแก๊ปปักโลโก้ ปรับขนาดได้',
        description: 'ผ้าคอตตอน ระบายอากาศ เหมาะสำหรับสั่งทำแบรนด์',
        price: 15,
        color: GREEN,
      },
      {
        name: 'ถุงเท้าข้อสั้น (แพ็ก 10 คู่)',
        description: 'ผ้าฝ้ายผสมสแปนเด็กซ์ ยืดหยุ่น ไม่อับชื้น',
        price: 22.5,
        color: WHITE,
      },
    ],
  },
];

async function insertId(db: Queryable, sql: string, values: unknown[]): Promise<number> {
  const { rows } = await db.query(sql, values);
  return requireRow(rows, 'catalog insert').id as number;
}

export async function seedCatalog(db: Queryable): Promise<boolean> {
  const existing = await db.query('SELECT 1 FROM shops LIMIT 1');
  if (existing.rows.length) return false;

  for (const shop of SHOPS) {
    const shopId = await insertId(db, 'INSERT INTO shops (name) VALUES ($1) RETURNING id', [shop.name]);

    for (const product of shop.products) {
      const variants = product.variants ?? [];
      const productId = await insertId(
        db,
        `INSERT INTO products (shop_id, name, description, price, is_simple)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [shopId, product.name, product.description, product.price, variants.length === 0],
      );

      await db.query('INSERT INTO product_uploads (product_id, file, type) VALUES ($1, $2, $3)', [
        productId,
        productTile(product.color),
        'main',
      ]);

      // The product page swaps the picture to the upload whose type equals the chosen variant's key
      for (const variant of variants) {
        await db.query(
          'INSERT INTO product_variants (product_id, display_name, key, price) VALUES ($1, $2, $3, $4)',
          [productId, variant.name, variant.key, variant.price],
        );
        await db.query('INSERT INTO product_uploads (product_id, file, type) VALUES ($1, $2, $3)', [
          productId,
          productTile(variant.color),
          variant.key,
        ]);
      }
    }
  }
  return true;
}
