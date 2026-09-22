const routes = [
  '/',
  '/cart',
  '/checkout',
  '/wedding-packages',
  '/b2b',
  '/track-order',
  '/account',
  '/compare',
  '/wishlist',
  '/admin',
  '/admin/approval',
  '/admin/pricing-margins',
  '/admin/orders',
  '/admin/returns',
  '/admin/bulk-upload',
  '/admin/suppliers',
  '/sales',
  '/sales/leads',
  '/sales/quotations',
  '/sales/listing',
  '/api/v1/categories',
  '/api/v1/brands',
  '/api/v1/products',
  '/api/v1/wedding-packages'
];

async function testAll() {
  console.log('Testing all AUREVO digital portal routes against http://localhost:3000...\n');
  let passed = 0;
  let failed = 0;

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      if (res.status >= 200 && res.status < 400) {
        console.log(`[PASS] ${res.status} ${r}`);
        passed++;
      } else {
        console.log(`[FAIL] ${res.status} ${r}`);
        failed++;
      }
    } catch (err) {
      console.log(`[ERR] ${r} -> ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} PASSED, ${failed} FAILED across ${routes.length} routes.`);
}

testAll();
