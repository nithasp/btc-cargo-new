import { Cart, ImportTemplate, Product } from '../types/content.types';
import { CatalogServiceDeps } from '../types/service.types';
import { notFound } from '../utils/errors';

const SIZE_PROPERTY = 20509;
const COLOR_PROPERTY = 1627207;

const IMPORT_TEMPLATES: ImportTemplate[] = [
  {
    title: 'เสื้อยืดคอกลมผ้าฝ้าย 100% ทรงโอเวอร์ไซซ์ (纯棉圆领T恤)',
    price: 39.9,
    originalPrice: 59,
    freight: 'ค่าจัดส่งในจีน ¥6.00',
    images: [
      'assets/img/mockup-img/temp-purchase-img.jpeg',
      'assets/img/mockup-img/dummy-products-300x300.png',
    ],
    sizes: [
      { id: '28314', name: 'S' },
      { id: '28315', name: 'M' },
      { id: '28316', name: 'L' },
      { id: '28317', name: 'XL' },
    ],
    colors: [
      { id: '28320', name: 'ขาว' },
      { id: '28341', name: 'ดำ' },
      { id: '28326', name: 'แดง' },
    ],
  },
  {
    title: 'รองเท้าผ้าใบลำลอง พื้นนุ่ม ระบายอากาศ (透气休闲运动鞋)',
    price: 128,
    originalPrice: 199,
    freight: 'ฟรีค่าจัดส่งในจีน',
    images: [
      'assets/img/mockup-img/temp-purchase-img.jpeg',
      'assets/img/mockup-img/product-image-placeholder.jpg',
    ],
    sizes: [
      { id: '30381', name: '38' },
      { id: '30382', name: '39' },
      { id: '30383', name: '40' },
      { id: '30384', name: '41' },
      { id: '30385', name: '42' },
    ],
    colors: [
      { id: '28320', name: 'ขาว' },
      { id: '28332', name: 'เทา' },
    ],
  },
  {
    title: 'กระเป๋าเป้สะพายหลังกันน้ำ ใส่โน้ตบุ๊ก 15.6 นิ้ว (防水电脑双肩包)',
    price: 89,
    originalPrice: 139,
    freight: 'ค่าจัดส่งในจีน ¥8.00',
    images: [
      'assets/img/mockup-img/temp-purchase-img.jpeg',
      'assets/img/mockup-img/dummy-products-300x300.png',
    ],
    sizes: [
      { id: '3271530', name: '20 ลิตร' },
      { id: '3271531', name: '30 ลิตร' },
    ],
    colors: [
      { id: '28341', name: 'ดำ' },
      { id: '28338', name: 'น้ำเงิน' },
      { id: '28332', name: 'เทา' },
    ],
  },
];

const hash = (value: string): number =>
  [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

function importedProduct(url: string) {
  const template = IMPORT_TEMPLATES[hash(url) % IMPORT_TEMPLATES.length] ?? IMPORT_TEMPLATES[0]!;

  const sku = template.sizes.flatMap((size, sizeIndex) =>
    template.colors.map((color) => {
      const price = Number((template.price + sizeIndex * 2).toFixed(2));
      const original = Number((template.originalPrice + sizeIndex * 2).toFixed(2));
      return {
        properties: `${SIZE_PROPERTY}:${size.id};${COLOR_PROPERTY}:${color.id}`,
        properties_name: `${size.name};${color.name}`,
        price,
        original_price: original,
        // The purchase page reads this key with its original typo
        orginal_price: original,
        quantity: 200,
      };
    }),
  );

  return {
    item: {
      num_iid: String(hash(url)),
      title: template.title,
      detail_url: url,
      price: template.price,
      original_price: template.originalPrice,
      has_discount: 'true',
      freight: template.freight,
      item_imgs: template.images,
      properties: {
        [SIZE_PROPERTY]: { name: 'ไซส์', types: template.sizes },
        [COLOR_PROPERTY]: { name: 'สี', types: template.colors },
      },
      sku,
    },
  };
}

function toCartItem(product: Product) {
  const image = product.uploads[0] ?? null;
  return {
    id: product.id,
    title: product.name,
    name: product.name,
    description: product.description,
    image: image?.file ?? 'assets/img/mockup-img/product-image-placeholder.jpg',
    price: Number(product.price),
    is_active: product.is_active,
    is_simple: true,
    has_stock: product.has_stock,
    shop: product.shop,
    shop_name: product.shop_name,
    variants: { id: -1 },
    uploads: image,
  };
}

export function createCatalogService({ carts, products }: CatalogServiceDeps) {
  return {
    async getCart(userId: number): Promise<Cart[]> {
      const cart = await carts.findByUser(userId);
      return cart ? [cart] : [];
    },

    saveCart(userId: number, json: unknown[]): Promise<Cart> {
      return carts.upsert(userId, json);
    },

    async updateCart(id: number, userId: number, json: unknown[]): Promise<Cart> {
      const cart = await carts.update(id, userId, json);
      if (!cart) throw notFound('Cart');
      return cart;
    },

    listProducts(): Promise<Product[]> {
      return products.listActive();
    },

    async listCartTestProducts() {
      return (await products.listActive()).map(toCartItem);
    },

    importProduct(url: string) {
      return importedProduct(url);
    },
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
