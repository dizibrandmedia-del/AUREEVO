import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('==================================================');
  console.log('  AUREEVO DATABASE SNAPSHOT BACKUP SUITE');
  console.log('==================================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `aureevo-backup-${timestamp}.json`);

  console.log(`[Backup] Extracting relational state from database...`);

  const [
    categories,
    brands,
    attributes,
    attributeValues,
    products,
    productVariants,
    inventories,
    users,
    orders,
    coupons,
    settings,
    cmsSections,
  ] = await Promise.all([
    prisma.category.findMany(),
    prisma.brand.findMany(),
    prisma.attribute.findMany(),
    prisma.attributeValue.findMany(),
    prisma.product.findMany(),
    prisma.productVariant.findMany(),
    prisma.inventory.findMany(),
    prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, status: true } }),
    prisma.order.findMany({ include: { items: true, payments: true, shipments: true } }),
    prisma.coupon.findMany(),
    prisma.adminSetting.findMany(),
    prisma.homepageSection.findMany({ include: { banners: true } }),
  ]);

  const backupPayload = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: {
      categories: categories.length,
      brands: brands.length,
      products: products.length,
      variants: productVariants.length,
      inventories: inventories.length,
      orders: orders.length,
      coupons: coupons.length,
    },
    data: {
      categories,
      brands,
      attributes,
      attributeValues,
      products,
      productVariants,
      inventories,
      users,
      orders,
      coupons,
      settings,
      cmsSections,
    },
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');

  console.log(`\n✔ [SUCCESS] Backup snapshot created successfully!`);
  console.log(`  File: ${backupFilePath}`);
  console.log(`  Summary: ${products.length} products, ${orders.length} orders, ${categories.length} categories.`);
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('❌ Backup Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
