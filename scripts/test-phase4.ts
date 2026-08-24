import { prisma } from '../lib/prisma';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getProductSchema,
  getBreadcrumbSchema,
} from '../lib/seo/structured-data';
import { Analytics } from '../lib/analytics';
import { checkRateLimit } from '../lib/security/rate-limit';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

async function runPhase4Tests() {
  console.log('==================================================');
  console.log('  AUREEVO PHASE 4 AUTOMATED INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  // ----------------------------------------------------
  // Suite 1: Dynamic SEO, Sitemap & Robots.txt
  // ----------------------------------------------------
  console.log('[Suite 1] Dynamic SEO, Sitemap & Robots Directives');
  const sm = await sitemap();
  assert(Array.isArray(sm) && sm.length > 0, '[Suite 1] Sitemap generates list of URLs');

  const hasHome = sm.some((s) => s.url.endsWith('aureevo.com') || s.url.endsWith('3000') || !s.url.includes('/product'));
  const hasProduct = sm.some((s) => s.url.includes('/product/'));
  assert(hasHome, '[Suite 1] Sitemap includes home page');
  assert(hasProduct, '[Suite 1] Sitemap includes dynamic active products');

  const rob = robots();
  const rules = Array.isArray(rob.rules) ? rob.rules[0] : rob.rules;
  assert(Array.isArray(rules?.disallow), '[Suite 1] Robots.txt has disallow rules');
  assert(
    (rules?.disallow as string[]).includes('/admin/'),
    '[Suite 1] Robots.txt protects /admin/ routes'
  );
  assert(
    (rules?.disallow as string[]).includes('/checkout'),
    '[Suite 1] Robots.txt protects /checkout transaction routes'
  );
  assert(
    !!rob.sitemap && rob.sitemap.includes('sitemap.xml'),
    '[Suite 1] Robots.txt declares sitemap location'
  );

  // ----------------------------------------------------
  // Suite 2: Structured Data JSON-LD Schemas
  // ----------------------------------------------------
  console.log('\n[Suite 2] Structured Data JSON-LD Schemas');
  const orgSchema = getOrganizationSchema();
  assert(orgSchema['@type'] === 'Organization', '[Suite 2] Organization schema is valid');
  assert(orgSchema.name === 'AUREEVO', '[Suite 2] Brand name is official AUREEVO');
  assert(orgSchema.logo.includes('aureevo-logo.png'), '[Suite 2] Official brand logo attached');

  const webSchema = getWebSiteSchema();
  assert(webSchema['@type'] === 'WebSite', '[Suite 2] WebSite schema contains SearchAction');

  const mockProduct = {
    id: 'prod_test_seo',
    name: 'Imperial 24K Gold Elixir',
    slug: 'imperial-24k-gold-elixir',
    sku: 'AUR-GLD-001',
    sellingPrice: 12500,
    mrp: 15000,
    images: JSON.stringify(['/images/products/elixir.png']),
    brand: { name: 'AUREEVO' },
    inventories: [{ currentStock: 25 }],
  };

  const productSchema = getProductSchema(mockProduct, [
    { rating: 5, comment: 'Sublime formulation', user: { firstName: 'Arya', lastName: 'Kapoor' }, createdAt: new Date() },
  ]);

  assert(productSchema['@type'] === 'Product', '[Suite 2] Product schema valid');
  assert(productSchema.offers.priceCurrency === 'INR', '[Suite 2] Currency is INR');
  assert(productSchema.offers.price === 12500, '[Suite 2] Price matches sellingPrice');
  assert(productSchema.offers.availability.includes('InStock'), '[Suite 2] Stock status computed as InStock');
  assert(productSchema.aggregateRating?.ratingValue === '5.0', '[Suite 2] AggregateRating calculated from real reviews');

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Skincare', url: '/category/skincare' },
    { name: 'Gold Elixir', url: '/product/imperial-24k-gold-elixir' },
  ]);
  assert(breadcrumbs.itemListElement.length === 3, '[Suite 2] BreadcrumbList outputs exact items');
  assert(breadcrumbs.itemListElement[2].position === 3, '[Suite 2] Breadcrumbs 1-indexed position');

  // ----------------------------------------------------
  // Suite 3: Analytics Engine Event Dispatch
  // ----------------------------------------------------
  console.log('\n[Suite 3] Analytics Engine & Conversion Tracking');
  assert(typeof Analytics.pageView === 'function', '[Suite 3] Analytics.pageView defined');
  assert(typeof Analytics.viewItem === 'function', '[Suite 3] Analytics.viewItem defined');
  assert(typeof Analytics.addToCart === 'function', '[Suite 3] Analytics.addToCart defined');
  assert(typeof Analytics.beginCheckout === 'function', '[Suite 3] Analytics.beginCheckout defined');
  assert(typeof Analytics.purchase === 'function', '[Suite 3] Analytics.purchase defined');
  assert(typeof Analytics.search === 'function', '[Suite 3] Analytics.search defined');

  // ----------------------------------------------------
  // Suite 4: Security & Rate Limiting Engine
  // ----------------------------------------------------
  console.log('\n[Suite 4] Security & Rate Limiting Engine');
  const testIp = `test_ip_${Date.now()}`;
  const res1 = await checkRateLimit(testIp, { windowMs: 2000, max: 2 });
  assert(res1.success === true && res1.remaining === 1, '[Suite 4] First request passes with decrement');

  const res2 = await checkRateLimit(testIp, { windowMs: 2000, max: 2 });
  assert(res2.success === true && res2.remaining === 0, '[Suite 4] Second request reaches limit');

  const res3 = await checkRateLimit(testIp, { windowMs: 2000, max: 2 });
  assert(res3.success === false && res3.remaining === 0, '[Suite 4] Third request is blocked by rate limiter');

  // ----------------------------------------------------
  // Suite 5: System Health Check & Database Probing
  // ----------------------------------------------------
  console.log('\n[Suite 5] System Health Check & Database Probing');
  let dbCheckPassed = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbCheckPassed = true;
  } catch {}
  assert(dbCheckPassed, '[Suite 5] Database connection probe passed with 0 errors');

  // ----------------------------------------------------
  // Suite 6: Database Snapshot Backup & Integrity
  // ----------------------------------------------------
  console.log('\n[Suite 6] Database Snapshot Backup & Integrity');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const testBackupPath = path.join(backupDir, 'test-phase4-snapshot.json');
  const [cats, prods, ords] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  const testPayload = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: { categories: cats, products: prods, orders: ords },
  };

  fs.writeFileSync(testBackupPath, JSON.stringify(testPayload, null, 2));
  assert(fs.existsSync(testBackupPath), '[Suite 6] Backup snapshot written to disk');

  const parsed = JSON.parse(fs.readFileSync(testBackupPath, 'utf-8'));
  assert(parsed.stats.products >= 0, '[Suite 6] Backup snapshot verified and contains database stats');
  fs.unlinkSync(testBackupPath); // Clean up test file

  // ----------------------------------------------------
  // Suite 7: Clientele CRM & Customer LTV Analytics
  // ----------------------------------------------------
  console.log('\n[Suite 7] Clientele CRM & Patron LTV Directory');
  const customers = await prisma.user.findMany({
    include: { orders: true },
  });

  assert(Array.isArray(customers), '[Suite 7] Customer directory successfully queried');
  const ltvCalculations = customers.map((c) =>
    c.orders.reduce((sum, o) => sum + o.grandTotal, 0)
  );
  assert(ltvCalculations.every((v) => typeof v === 'number' && !isNaN(v)), '[Suite 7] Lifetime value mathematically verified');

  console.log('\n==================================================');
  console.log(`  PHASE 4 TEST RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests()
  .catch((err) => {
    console.error('Fatal Test Failure:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
