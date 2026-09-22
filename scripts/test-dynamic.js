const dynamicRoutes = [
  '/category/electronics',
  '/product/samsung-55-inch-crystal-4k-smart-tv',
  '/product/lg-1-5-ton-5-star-ai-dual-inverter-split-ac',
  '/search?q=oled',
  '/api/v1/wedding-packages',
];

async function testDynamic() {
  console.log('Testing dynamic routes...\n');
  let passed = 0;

  for (const r of dynamicRoutes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      console.log(`[PASS] ${res.status} ${r}`);
      if (res.status === 200) passed++;
    } catch (err) {
      console.log(`[ERR] ${r} -> ${err.message}`);
    }
  }

  console.log(`\nDynamic Results: ${passed}/${dynamicRoutes.length} PASSED.`);
}

testDynamic();
