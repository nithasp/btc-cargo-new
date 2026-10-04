import { config } from '../config';
import pool, { withTransaction } from '../database';
import { seedCatalog } from '../seeds/catalog';
import { seedContent } from '../seeds/content';
import { seedDemo } from '../seeds/demo';
import { seedMasterData } from '../seeds/masterData';

const DATA_TABLES = [
  'carts',
  'product_uploads',
  'product_variants',
  'products',
  'shops',
  'affiliate_members',
  'affiliate_teams',
  'price_sets',
  'verification_images',
  'verifications',
  'china_trackings',
  'lots',
  'payments',
  'payment_gateways',
  'sale_orders',
  'wallets',
  'uploads',
  'notifications',
  'html_contents',
  'currency_rates',
  'alipay_accounts',
  'local_deliveries',
  'thai_carriers',
  'shop_types',
  'stock_locations',
  'stock_picking_types',
  'product_type_delivery_types',
  'product_types',
  'delivery_types',
  'addresses',
  'social_accounts',
  'refresh_tokens',
  'users',
];

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');
  const force = process.argv.includes('--force');

  if (reset) {
    // Wiping every table is irreversible, so on a production database it needs an explicit --force
    if (config.isProduction && !force) {
      throw new Error(
        'Refusing to wipe a production database. Run "npm run seed:reset -- --force" to do it anyway.',
      );
    }
    await pool.query(`TRUNCATE TABLE ${DATA_TABLES.join(', ')} RESTART IDENTITY CASCADE`);
    console.log('[seed] all tables emptied');
  }

  const result = await withTransaction(async (tx) => {
    await seedMasterData(tx);
    await seedContent(tx);
    const catalog = await seedCatalog(tx);
    const demo = await seedDemo(tx);
    return { catalog, demo };
  });

  console.log('[seed] reference data and page content are up to date');
  console.log(`[seed] product catalog: ${result.catalog ? 'created' : 'already present, left as is'}`);
  console.log(
    result.demo.created
      ? `[seed] demo account created — username "${result.demo.username}", password from DEMO_PASSWORD`
      : `[seed] demo account "${result.demo.username}" already exists, left as is (use "npm run seed:reset" to rebuild it)`,
  );
}

main()
  .catch((err: Error) => {
    console.error(`[seed] ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
