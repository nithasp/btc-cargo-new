import { config } from '../config';
import { AffiliateRepository } from '../repositories/affiliate.repository';
import { PaymentGatewayRepository } from '../repositories/paymentGateway.repository';
import { ProductRepository } from '../repositories/product.repository';
import { SaleOrderRepository } from '../repositories/saleOrder.repository';
import { UserRepository } from '../repositories/user.repository';
import { btcCodeFor, STANDARD_VOLUME_PRICE, STANDARD_WEIGHT_PRICE } from '../services/affiliate.service';
import { hashPassword } from '../services/password.service';
import { DEFAULT_WALLET_NAME } from '../services/user.service';
import { PriceKey, PriceMap } from '../types/affiliate.types';
import { Queryable } from '../types/database.types';
import { LOCATION } from '../types/masterData.types';
import { BillSeed, LotOptions, LotTotals, Stage } from '../types/seed.types';
import { BoxType } from '../types/tracking.types';
import { round2 } from '../utils/format';
import { requireRow } from '../utils/rows';
import { productTile } from './images';

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPRESS_CARRIER = 2;
const TEAM_COMMISSION_RATE = 5;
const EXCHANGE_RATE = 5.02;

const users = new UserRepository();
const affiliates = new AffiliateRepository();
const saleOrders = new SaleOrderRepository();
const paymentGateways = new PaymentGatewayRepository();
const products = new ProductRepository();

const STAGE_LOCATION: Record<Stage, number> = {
  cn: LOCATION.CN_WAREHOUSE,
  transit: LOCATION.TRANSIT,
  th: LOCATION.TH_WAREHOUSE,
};

const PRODUCT_TYPE_KEYS: Record<number, PriceKey> = { 1: 'p', 2: 'd', 5: 'sp' };
const PACKING_COST: Record<BoxType, number> = { no: 0, normal: 150, solid: 280 };
const COURIERS = [
  { prefix: 'YT', digits: 13 },
  { prefix: 'SF', digits: 13 },
  { prefix: '77', digits: 12 },
  { prefix: 'JT', digits: 13 },
  { prefix: '43', digits: 13 },
  { prefix: 'DPK', digits: 12 },
];

function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => Math.floor(next() * (max - min + 1)) + min;
  return {
    int,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T,
    digits: (count: number): string => Array.from({ length: count }, () => int(0, 9)).join(''),
  };
}

type Random = ReturnType<typeof createRandom>;

const ago = (days: number, minutes = 0): Date => new Date(Date.now() - days * DAY_MS - minutes * 60_000);

const yymmdd = (date: Date): string => date.toISOString().slice(2, 10).replace(/-/g, '');

async function insert(db: Queryable, table: string, row: Record<string, unknown>): Promise<number> {
  const columns = Object.keys(row);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const { rows } = await db.query(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING id`,
    Object.values(row),
  );
  return requireRow(rows, `INSERT INTO ${table}`).id as number;
}

function createParcelFactory(db: Queryable, random: Random) {
  const serials = new Set<string>();
  let lotSequence = 0;

  function trackingNumber(): string {
    for (;;) {
      const courier = random.pick(COURIERS);
      const serial = `${courier.prefix}${random.digits(courier.digits)}`;
      if (!serials.has(serial)) {
        serials.add(serial);
        return serial;
      }
    }
  }

  async function lot(options: LotOptions): Promise<LotTotals> {
    const { stage, daysAgo } = options;
    const boxType = options.boxType ?? 'no';
    lotSequence += 1;

    const quantity = random.int(1, 6);
    const width = random.int(20, 60);
    const depth = random.int(25, 70);
    const height = random.int(15, 50);
    const weight = random.int(15, 180) / 10;
    const volume = Number(((width * depth * height) / 1_000_000).toFixed(4));
    const totalWeight = round2(weight * quantity);
    const totalVolume = Number((volume * quantity).toFixed(4));

    const productTypeId = random.pick([1, 1, 1, 2, 5]);
    const priceKey = PRODUCT_TYPE_KEYS[productTypeId] ?? 'p';
    const deliveryCost = round2(
      Math.max(totalWeight * STANDARD_WEIGHT_PRICE[priceKey], totalVolume * STANDARD_VOLUME_PRICE[priceKey]),
    );
    const packingCost = PACKING_COST[boxType];
    const qcCost = options.qc ? 20 * quantity : 0;
    const extraCost = random.pick([0, 0, 0, 20]);
    const otherCost = packingCost + qcCost + extraCost;
    const thOtherCost = stage === 'th' ? random.pick([0, 0, 50]) : 0;
    const totalCost = round2(deliveryCost + otherCost + thOtherCost);

    const checkin = ago(daysAgo, random.int(0, 600));
    const checkout = stage === 'cn' ? null : ago(daysAgo - 2, random.int(0, 600));
    const container = checkout
      ? {
          name: `GZ${yymmdd(checkout)}-${priceKey === 'sp' ? 'SEA' : 'EK'}0${random.int(1, 3)}`,
          sequence: random.int(1, 180),
        }
      : null;

    const id = await insert(db, 'lots', {
      user_id: options.userId,
      serial_number: `BTC${yymmdd(checkin)}-${String(lotSequence).padStart(4, '0')}`,
      shopping_serial: options.serial,
      shipping_lot: container?.name ?? null,
      shipping_lot_sequence: container?.sequence ?? null,
      po_number: `PO${random.digits(8)}`,
      packing_type: boxType,
      product_type_id: productTypeId,
      quantity,
      weight,
      width,
      depth,
      height,
      volume,
      total_weight: totalWeight,
      total_volume: totalVolume,
      delivery_cost: deliveryCost,
      packing_cost: packingCost,
      qc_cost: qcCost,
      extra_cost: extraCost,
      other_cost: otherCost,
      th_other_cost: thOtherCost,
      total_cost: totalCost,
      remarks: options.remarks ?? '',
      note: options.note ?? '',
      product_image: options.productImage ?? null,
      current_location_id: STAGE_LOCATION[stage],
      cn_checkin: checkin,
      cn_checkout: checkout,
      th_expected_checkin: ago(daysAgo - 9),
      th_checkin: stage === 'th' ? ago(daysAgo - 8, random.int(0, 600)) : null,
      confirm_state: options.pending ? 'pending' : 'none',
      created_at: checkin,
    });

    return { id, quantity, deliveryCost, otherCost: otherCost + thOtherCost, totalCost };
  }

  async function tracking(
    userId: number,
    serial: string,
    daysAgo: number,
    options: { lotId?: number; boxType?: BoxType; qc?: boolean; picture?: boolean; remarks?: string } = {},
  ): Promise<void> {
    await insert(db, 'china_trackings', {
      user_id: userId,
      shopping_serial: serial,
      delivery_type_id: random.pick([1, 1, 2]),
      shipping_with_box: options.boxType ?? 'no',
      qc: options.qc ?? false,
      required_picture: options.picture ?? false,
      remarks: options.remarks ?? '',
      lot_id: options.lotId ?? null,
      created_at: ago(daysAgo + 3),
    });
  }

  async function received(
    userId: number,
    stage: Stage,
    daysAgo: number,
    options: { boxType?: BoxType; qc?: boolean; remarks?: string } = {},
  ): Promise<LotTotals> {
    const serial = trackingNumber();
    const totals = await lot({ userId, serial, stage, daysAgo, ...options });
    await tracking(userId, serial, daysAgo, { lotId: totals.id, ...options });
    return totals;
  }

  return { trackingNumber, lot, tracking, received };
}

type Parcels = ReturnType<typeof createParcelFactory>;

const ADDRESS_JSON = (name: string, phone: string, line1: string, line2: string) => ({
  name,
  phone_number: phone,
  line1,
  line2,
});

async function saleOrder(
  db: Queryable,
  order: {
    userId: number;
    lots: LotTotals[];
    daysAgo: number;
    team?: { teamId: number; memberId: number; sellingPrice: number } | undefined;
    discount?: number | undefined;
  },
): Promise<{ id: number; total: number; quantity: number }> {
  const deliveryPrice = round2(order.lots.reduce((sum, lot) => sum + lot.deliveryCost, 0));
  const otherCost = round2(order.lots.reduce((sum, lot) => sum + lot.otherCost, 0));
  const total = round2(deliveryPrice + otherCost);
  const commission = order.team ? round2((deliveryPrice * TEAM_COMMISSION_RATE) / 100) : 0;

  const created = await saleOrders.create(
    {
      userId: order.userId,
      carrierId: EXPRESS_CARRIER,
      localDeliveryId: 1,
      deliveryAddress: ADDRESS_JSON('ผู้รับสินค้า', '0812345678', '99/1 ถนนแจ้งวัฒนะ', '104101'),
      invoiceAddress: ADDRESS_JSON('ผู้รับใบเสร็จ', '0812345678', '99/1 ถนนแจ้งวัฒนะ', '104101'),
      deliveryPrice,
      otherCost,
      storageCost: 0,
      totalCost: total,
      affiliateTeamId: order.team?.teamId ?? null,
      affiliateMemberId: order.team?.memberId ?? null,
      costPrice: order.team ? STANDARD_WEIGHT_PRICE.p : 0,
      sellingPrice: order.team?.sellingPrice ?? 0,
      affiliateCommission: commission,
    },
    db,
  );

  await db.query(
    `UPDATE sale_orders SET created_at = $1::timestamptz, discount_commission = $2,
       name = 'SO' || to_char($1::timestamptz, 'YYMM') || right(name, 6)
     WHERE id = $3`,
    [ago(order.daysAgo), Math.min(order.discount ?? 0, commission), created.id],
  );
  await db.query('UPDATE lots SET sale_order_id = $1 WHERE id = ANY($2::int[])', [
    created.id,
    order.lots.map((lot) => lot.id),
  ]);

  return { id: created.id, total, quantity: order.lots.reduce((sum, lot) => sum + lot.quantity, 0) };
}

async function bill(
  db: Queryable,
  entry: Parameters<PaymentGatewayRepository['create']>[0] & { daysAgo: number },
): Promise<void> {
  const { daysAgo, ...values } = entry;
  const created = await paymentGateways.create(values, db);
  await db.query(
    `UPDATE payment_gateways SET created_at = $1::timestamptz, paid_at = $2,
       name = left(name, 2) || to_char($1::timestamptz, 'YYMM') || right(name, 6)
     WHERE id = $3`,
    [
      ago(daysAgo),
      values.state === 'paid' || values.state === 'done' ? ago(daysAgo - 0.2) : null,
      created.id,
    ],
  );
}

const withMarkup = (prices: PriceMap, factor: number): PriceMap =>
  Object.fromEntries(
    Object.entries(prices).map(([key, value]) => [key, Math.round(value * factor)]),
  ) as PriceMap;

async function seedAffiliate(db: Queryable, ownerId: number) {
  const costingId = await affiliates.createPriceSet(STANDARD_WEIGHT_PRICE, STANDARD_VOLUME_PRICE, db);
  const sellingId = await affiliates.createPriceSet(
    withMarkup(STANDARD_WEIGHT_PRICE, 1.2),
    withMarkup(STANDARD_VOLUME_PRICE, 1.2),
    db,
  );
  await affiliates.createTeam(
    {
      ownerUserId: ownerId,
      btcCode: btcCodeFor(ownerId),
      commissionRate: TEAM_COMMISSION_RATE,
      monthlyGoal: 2500,
      costingId,
      sellingId,
    },
    db,
  );
  const team = await affiliates.findTeamByOwner(ownerId, db);
  if (!team) throw new Error('[seed] the affiliate team was not created');

  const members = [
    {
      code: 'BTCNORTH',
      name: 'ร้านเหนือนำเข้า',
      email: 'north@agent.example',
      phone: '0531234567',
      line1: '120 ถนนห้วยแก้ว',
      line2: '500108',
      markup: 1.28,
    },
    {
      code: 'BTCISAN',
      name: 'อีสานคาร์โก้',
      email: 'isan@agent.example',
      phone: '0432345678',
      line1: '45 ถนนมิตรภาพ',
      line2: '400101',
      markup: 1.24,
    },
    {
      code: 'BTCSOUTH',
      name: 'หาดใหญ่ชิปปิ้ง',
      email: 'south@agent.example',
      phone: '0743456789',
      line1: '8 ถนนเพชรเกษม',
      line2: '901101',
      markup: 1.3,
    },
    {
      code: 'BTCEAST',
      name: 'ชลบุรีอิมพอร์ต',
      email: 'east@agent.example',
      phone: '0384567890',
      line1: '77 ถนนสุขุมวิท',
      line2: '200104',
      markup: 1.2,
    },
    {
      code: 'BTCBKK',
      name: 'บางกอกเทรดดิ้ง',
      email: 'bkk@agent.example',
      phone: '0256789012',
      line1: '301 ถนนพหลโยธิน',
      line2: '103001',
      markup: 1.16,
    },
  ];

  const saved: { id: number; code: string; sellingPrice: number }[] = [];
  for (const member of members) {
    const weight = withMarkup(STANDARD_WEIGHT_PRICE, member.markup);
    const priceSetId = await affiliates.createPriceSet(
      weight,
      withMarkup(STANDARD_VOLUME_PRICE, member.markup),
      db,
    );
    const id = await affiliates.createMember(
      team.id,
      priceSetId,
      {
        affiliateCode: member.code,
        name: member.name,
        email: member.email,
        commissionType: 'cost',
        referralCode: 'RBTCXA11',
        commissionRate: TEAM_COMMISSION_RATE,
        btcCode: team.btcCode,
        vat: '',
        phoneNumber: member.phone,
        line1: member.line1,
        line2: member.line2,
      },
      db,
    );
    saved.push({ id, code: member.code, sellingPrice: weight.p });
  }
  return { teamId: team.id, members: saved };
}

async function seedReferredCustomers(
  db: Queryable,
  random: Random,
  parcels: Parcels,
  team: Awaited<ReturnType<typeof seedAffiliate>>,
): Promise<void> {
  const customers = [
    { username: 'somchai_shop', firstName: 'สมชาย', lastName: 'ใจดี', member: 0 },
    { username: 'malee_import', firstName: 'มาลี', lastName: 'รุ่งเรือง', member: 1 },
    { username: 'wichai_trade', firstName: 'วิชัย', lastName: 'ศรีสุข', member: 2 },
    { username: 'napa_store', firstName: 'นภา', lastName: 'แสงทอง', member: 4 },
  ];

  const accounts: { id: number; member: (typeof team.members)[number] }[] = [];
  for (const customer of customers) {
    const member = team.members[customer.member];
    if (!member) continue;
    // No password is stored: these accounts exist to own the referred orders and cannot sign in
    const user = await users.create(
      {
        username: customer.username,
        email: `${customer.username}@customer.example`,
        passwordHash: null,
        firstName: customer.firstName,
        lastName: customer.lastName,
        referralCode: member.code,
      },
      db,
    );
    accounts.push({ id: user.id, member });
  }

  const discounts = [0, 20, 0, 0, 35, 0, 15, 0, 0, 50, 0, 0, 10, 0];
  for (const [index, discount] of discounts.entries()) {
    const account = accounts[index % accounts.length];
    if (!account) continue;
    const daysAgo = 44 - index * 3;

    const lots: LotTotals[] = [];
    for (let count = random.int(1, 3); count > 0; count -= 1) {
      lots.push(await parcels.received(account.id, 'th', daysAgo + 12));
    }
    await saleOrder(db, {
      userId: account.id,
      lots,
      daysAgo,
      discount,
      team: { teamId: team.teamId, memberId: account.member.id, sellingPrice: account.member.sellingPrice },
    });
  }
}

async function seedParcels(db: Queryable, random: Random, parcels: Parcels, userId: number): Promise<void> {
  for (const daysAgo of [16, 14, 13, 12, 11, 10, 10]) {
    await parcels.received(userId, 'th', daysAgo, {
      boxType: random.pick(['no', 'no', 'normal', 'solid'] as const),
      qc: random.pick([true, false]),
      remarks: random.pick(['', '', 'รอรวมบิลกับพัสดุรอบถัดไป']),
    });
  }
  for (const daysAgo of [7, 6, 5]) {
    await parcels.received(userId, 'transit', daysAgo, {
      boxType: random.pick(['no', 'no', 'normal'] as const),
    });
  }
  for (const daysAgo of [3, 2, 1]) {
    await parcels.received(userId, 'cn', daysAgo, { qc: random.pick([true, false, false]) });
  }

  const registered: { boxType?: BoxType; qc?: boolean; picture?: boolean; remarks?: string }[] = [
    { boxType: 'normal', picture: true, remarks: 'ของแตกง่าย กรุณาตีลังไม้' },
    { qc: true, remarks: 'เสื้อผ้าเด็ก 2 ลัง' },
  ];
  for (const options of registered) {
    await parcels.tracking(userId, parcels.trackingNumber(), -3, options);
  }
}

async function seedBills(db: Queryable, random: Random, parcels: Parcels, userId: number): Promise<void> {
  const bills: BillSeed[] = [
    { daysAgo: 48, state: 'done', gateway: 'bank' },
    { daysAgo: 43, state: 'done', gateway: 'alipay' },
    { daysAgo: 37, state: 'done', gateway: 'bank' },
    { daysAgo: 33, state: 'cancel', gateway: 'bank' },
    { daysAgo: 29, state: 'done', gateway: 'alipay', credit: 120 },
    { daysAgo: 24, state: 'done', gateway: 'bank' },
    { daysAgo: 21, state: 'done', lots: 2 },
    { daysAgo: 19, state: 'done', gateway: 'alipay' },
    { daysAgo: 15, state: 'done', gateway: 'bank' },
    { daysAgo: 11, state: 'done', gateway: 'alipay', credit: 60.5 },
    { daysAgo: 9, state: 'done', lots: 1 },
    { daysAgo: 6, state: 'done', gateway: 'bank' },
    { daysAgo: 2, state: 'wait', gateway: 'alipay' },
    { daysAgo: 1, state: 'wait', lots: 2 },
    { daysAgo: 0.1, state: 'wait', gateway: 'bank' },
  ];

  for (const entry of bills) {
    if (entry.lots) {
      const lots: LotTotals[] = [];
      for (let count = entry.lots; count > 0; count -= 1) {
        lots.push(await parcels.received(userId, 'th', entry.daysAgo + 11));
      }
      const order = await saleOrder(db, { userId, lots, daysAgo: entry.daysAgo });
      await bill(db, {
        userId,
        prefix: 'TP',
        serviceType: 'delivery',
        gatewayType: 'bank',
        state: entry.state,
        quantity: order.quantity,
        amountPay: order.total,
        amountCurrency: order.total,
        currency: 'THB',
        saleOrderId: order.id,
        daysAgo: entry.daysAgo,
      });
      continue;
    }

    const amount = random.int(5, 80) * 100;
    const rate = Number((EXCHANGE_RATE + random.int(-6, 6) / 100).toFixed(2));
    const credit = entry.credit ?? 0;
    const bank = entry.gateway === 'bank';

    await bill(db, {
      userId,
      prefix: 'EX',
      serviceType: 'payment',
      gatewayType: entry.gateway ?? 'bank',
      accountType: bank ? 'detail' : null,
      accountName: bank
        ? random.pick(['广州市新风贸易有限公司', '义乌市恒达商贸', '深圳市华强电子商行'])
        : null,
      accountNumber: bank ? `6222${random.digits(15)}` : null,
      alipayAccountId: bank ? null : 1,
      description: bank ? 'ชำระค่าสินค้าให้ร้านค้า' : 'ฝากจ่าย Alipay',
      state: entry.state,
      quantity: amount,
      amountPay: amount,
      amountCurrency: round2((amount - credit) * rate),
      creditUsed: credit,
      rate,
      currency: 'CNY',
      daysAgo: entry.daysAgo,
    });
  }
}

async function seedToConfirm(db: Queryable, random: Random, parcels: Parcels, userId: number): Promise<void> {
  const notes = [
    'กล่องไม่ระบุรหัสสมาชิก - เสื้อผ้าแฟชั่น',
    'รองเท้าผ้าใบ 12 คู่',
    'อุปกรณ์อิเล็กทรอนิกส์ ไม่มีใบปะหน้า',
    'ของเล่นเด็ก กล่องบุบเล็กน้อย',
    'เคสโทรศัพท์คละแบบ',
    'ผ้าม่านสำเร็จรูป 3 ม้วน',
  ];
  const colors: [number, number, number][] = [
    [94, 114, 228],
    [45, 206, 137],
    [251, 99, 64],
    [17, 205, 239],
  ];

  for (let index = 0; index < 12; index += 1) {
    await parcels.lot({
      userId,
      serial: parcels.trackingNumber(),
      stage: index % 3 === 0 ? 'th' : 'cn',
      daysAgo: index % 3 === 0 ? 10 + index : index,
      pending: true,
      note: notes[index % notes.length] ?? '',
      productImage: index % 2 === 0 ? productTile(random.pick(colors)) : null,
    });
  }
}

async function seedNotifications(db: Queryable, userId: number): Promise<void> {
  const entries: [number, string, string, string, string][] = [
    [
      0.02,
      'พัสดุถึงโกดังไทย',
      'พัสดุของคุณ 7 รายการถึงโกดังไทยแล้ว สามารถสร้างบิลค่าขนส่งได้',
      '/web/transport-payment',
      'สร้างรายการชำระเงิน',
    ],
    [0.3, 'สร้างรายการแลกเงิน', 'รายการแลกเงินหยวนของคุณรอชำระเงิน', '/web/create-exchange', 'ดูรายการ'],
    [1, 'สร้างบิลค่าขนส่ง', 'บิลค่าขนส่งใหม่รอชำระเงิน กรุณาชำระภายใน 3 วัน', '/web/bills', 'ดูบิลทั้งหมด'],
    [
      2,
      'พัสดุรอการยืนยันเจ้าของ',
      'มีพัสดุ 12 รายการที่ไม่ระบุรหัสสมาชิก กรุณายืนยันเจ้าของ',
      '/web/goods-confirm',
      'ยืนยันเจ้าของ',
    ],
    [
      3,
      'พัสดุออกจากจีน',
      'พัสดุ 4 รายการออกจากโกดังจีนแล้ว คาดว่าจะถึงไทยภายใน 5-7 วัน',
      '/web/parcel-list',
      'ดูรายการพัสดุ',
    ],
    [4, 'ค่าคอมมิชชัน', 'มีรายการขนส่งใหม่จากตัวแทนของคุณ', '/web/manage-parcel', 'จัดการพัสดุ'],
    [
      6,
      'ยืนยันการชำระเงิน',
      'ตรวจสอบการชำระเงินรายการแลกเงินเรียบร้อยแล้ว',
      '/web/create-exchange',
      'ดูรายการ',
    ],
    [9, 'ยืนยันการชำระเงิน', 'ตรวจสอบการชำระเงินค่าขนส่งเรียบร้อยแล้ว', '/web/bills', 'ดูบิลทั้งหมด'],
    [
      12,
      'พัสดุเข้าโกดังจีน',
      'โกดังจีนรับพัสดุของคุณเข้าระบบแล้ว 5 รายการ',
      '/web/parcel-list',
      'ดูรายการพัสดุ',
    ],
    [
      15,
      'อัตราแลกเปลี่ยน',
      'อัตราแลกเปลี่ยนเงินหยวนวันนี้มีการปรับปรุง',
      '/web/create-exchange',
      'ดูอัตราแลกเปลี่ยน',
    ],
    [
      20,
      'ยืนยันตัวตนตัวแทนสำเร็จ',
      'คุณสามารถสร้างและจัดการตัวแทนได้แล้ว',
      '/web/agent',
      'สร้าง/แก้ไขตัวแทน',
    ],
    [
      22,
      'ยืนยันตัวตนสำเร็จ',
      'คุณสามารถใช้บริการโอน/แลก/จ่ายเงินหยวนได้แล้ว',
      '/web/create-exchange',
      'สร้างรายการแลกเงิน',
    ],
    [28, 'ประกาศวันหยุด', 'โกดังจีนหยุดทำการช่วงวันชาติจีน 1-7 ตุลาคม', '/faq/delivery', 'อ่านรายละเอียด'],
    [
      30,
      'ยินดีต้อนรับ',
      'ยินดีต้อนรับสู่ BTC-HUB เริ่มต้นใช้งานโดยดูที่อยู่โกดังจีนของคุณ',
      '/web/warehouse-address',
      'ดูที่อยู่โกดังจีน',
    ],
  ];

  for (const [daysAgo, title, message, link, linkText] of entries) {
    await insert(db, 'notifications', {
      user_id: userId,
      actor: 'BTC Cargo',
      title,
      message,
      link,
      link_text: linkText,
      created_at: ago(daysAgo),
    });
  }
}

async function seedCart(db: Queryable, userId: number): Promise<void> {
  const catalog = await products.listActive(db);
  const chosen = [catalog[0], catalog[1], catalog[3]].filter((product) => product !== undefined);
  if (!chosen.length) return;

  const shops = new Map<number, { shop_id: number; shop_name: string; products: unknown[] }>();
  for (const [index, product] of chosen.entries()) {
    const variant = product.variants[0];
    const quantity = index + 1;
    const price = Number(product.price);
    const shop = shops.get(product.shop) ?? {
      shop_id: product.shop,
      shop_name: product.shop_name,
      products: [],
    };

    shop.products.push({
      ...product,
      price,
      quantity,
      selected: false,
      totalPrice: round2(price * quantity),
      variants: variant ?? { id: -1 },
      uploads: product.uploads.find((upload) => upload.type === variant?.key) ?? product.uploads[0] ?? null,
    });
    shops.set(product.shop, shop);
  }

  await db.query('INSERT INTO carts (user_id, json) VALUES ($1, $2)', [
    userId,
    JSON.stringify([...shops.values()]),
  ]);
}

export async function seedDemo(db: Queryable): Promise<{ created: boolean; username: string }> {
  const { username, password, email } = config.demo;
  if (await users.usernameExists(username, db)) return { created: false, username };

  const random = createRandom(20261003);
  const parcels = createParcelFactory(db, random);

  const demo = await users.create(
    { username, email, passwordHash: await hashPassword(password), firstName: 'Demo', lastName: 'Customer' },
    db,
  );
  const userId = demo.id;

  const addresses = [
    {
      name: 'บ้าน',
      person: 'Demo Customer',
      telephone: '0812345678',
      is_juristic: false,
      vat: '',
      address: '99/1 ซอยแจ้งวัฒนะ 14 ถนนแจ้งวัฒนะ',
      district: '104101',
    },
    {
      name: 'ออฟฟิศ',
      person: 'บริษัท เดโม เทรดดิ้ง จำกัด',
      telephone: '029876543',
      is_juristic: true,
      vat: '0105561234567',
      address: '88 อาคารเดโมทาวเวอร์ ชั้น 12 ถนนแจ้งวัฒนะ',
      district: '120601',
    },
    {
      name: 'โกดังเชียงใหม่',
      person: 'คุณสมศรี (ผู้ดูแลโกดัง)',
      telephone: '0898765432',
      is_juristic: false,
      vat: '',
      address: '120 หมู่ 4 ถนนห้วยแก้ว',
      district: '500108',
    },
  ];
  const addressIds: number[] = [];
  for (const address of addresses)
    addressIds.push(await insert(db, 'addresses', { user_id: userId, ...address }));

  await db.query(
    `UPDATE users SET telephone = $1, gender = $2, birth_date = $3, line = $4, has_consent = true,
       shipping_address_id = $5, billing_address_id = $6, created_at = $7
     WHERE id = $8`,
    ['0812345678', 'male', '1995-06-15', 'btc.demo', addressIds[0], addressIds[1], ago(30), userId],
  );

  const wallets = [
    { name: DEFAULT_WALLET_NAME, credit_amount: 1250.5, remark: 'เงินคืนจากรายการที่ยกเลิก', daysAgo: 30 },
    { name: 'ค่าสินค้า Taobao', credit_amount: 480, remark: '', daysAgo: 22 },
    { name: 'สำรอง', credit_amount: 0, remark: '', daysAgo: 8 },
  ];
  for (const { daysAgo, ...wallet } of wallets) {
    await insert(db, 'wallets', { user_id: userId, ...wallet, created_at: ago(daysAgo) });
  }

  for (const [kind, daysAgo] of [
    ['partner', 22],
    ['affiliate', 20],
  ] as const) {
    await insert(db, 'verifications', {
      user_id: userId,
      kind,
      state: 'verified',
      created_at: ago(daysAgo + 1),
      reviewed_at: ago(daysAgo),
    });
  }

  const team = await seedAffiliate(db, userId);
  await seedReferredCustomers(db, random, parcels, team);
  await seedBills(db, random, parcels, userId);
  await seedParcels(db, random, parcels, userId);
  await seedToConfirm(db, random, parcels, userId);
  await seedNotifications(db, userId);
  await seedCart(db, userId);

  return { created: true, username };
}
