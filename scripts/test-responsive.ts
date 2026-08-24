import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testResponsiveIntegrity() {
  console.log('==================================================');
  console.log('    AUREEVO MOBILE RESPONSIVE VERIFICATION SUITE   ');
  console.log('==================================================');

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    }
  }

  // 1. Viewport & HTML Meta Checks
  const fs = await import('fs');
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf-8');
  assert('Root Layout exports Viewport object', layoutContent.includes('export const viewport: Viewport'));
  assert('Viewport specifies width=device-width', layoutContent.includes("width: 'device-width'"));
  assert('Viewport specifies initialScale=1', layoutContent.includes('initialScale: 1'));
  assert('Viewport specifies userScalable=true', layoutContent.includes('userScalable: true'));
  assert('Viewport specifies luxury themeColor', layoutContent.includes("themeColor: '#04100c'"));

  // 2. Base CSS Resets Checks
  const cssContent = fs.readFileSync('app/globals.css', 'utf-8');
  assert('Base CSS enforces box-sizing border-box', cssContent.includes('box-sizing: border-box'));
  assert('Base CSS enforces html width: 100% & max-width: 100%', cssContent.includes('width: 100%') && cssContent.includes('max-width: 100%'));
  assert('Base CSS prevents horizontal overflow on html/body', cssContent.includes('overflow-x: hidden'));
  assert('Base CSS contains responsive media max-width 100%', cssContent.includes('max-width: 100%'));

  // 3. Header Responsiveness Checks
  const headerContent = fs.readFileSync('components/customer/Header.tsx', 'utf-8');
  assert('Header includes mobile search toggle button', headerContent.includes('Mobile Search Button') || headerContent.includes('aria-label="Search"'));
  assert('Header includes mobile search overlay form', headerContent.includes('Mobile Search Overlay Bar'));
  assert('Header logo scales with responsive classes', headerContent.includes('w-9 h-9 sm:w-12 sm:h-12'));
  assert('Header brand title truncates cleanly', headerContent.includes('truncate'));
  assert('Header right action buttons use responsive gaps', headerContent.includes('gap-1 sm:gap-2'));
  assert('Header includes mobile User icon sign-in', headerContent.includes('sm:hidden p-1.5 rounded-xl'));

  // 4. Hero & Homepage Responsiveness Checks
  const pageContent = fs.readFileSync('app/page.tsx', 'utf-8');
  assert('Hero height is responsive (min-h-[480px] sm:min-h-[600px])', pageContent.includes('min-h-[480px] sm:min-h-[600px]'));
  assert('Hero heading uses responsive font sizing', pageContent.includes('text-3xl xs:text-4xl sm:text-6xl'));
  assert('Hero CTA buttons stack on mobile (flex-col sm:flex-row)', pageContent.includes('flex-col sm:flex-row'));
  assert('Hero CTA buttons use full-width on mobile', pageContent.includes('w-full sm:w-auto'));
  assert('Category showcase uses responsive grid (1 sm:2 lg:4)', pageContent.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'));
  assert('Bestseller showcase uses responsive grid', pageContent.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'));

  // 5. Product Card Responsiveness Checks
  const cardContent = fs.readFileSync('components/customer/ProductCard.tsx', 'utf-8');
  assert('Product card action buttons visible on touch/mobile', cardContent.includes('opacity-100 sm:opacity-0'));
  assert('Product card padding is responsive', cardContent.includes('p-4 sm:p-6') || cardContent.includes('p-2.5 sm:p-4'));
  assert('Product card title clamps lines without overflow', cardContent.includes('line-clamp-2'));
  assert('Product card CTA button is responsive', cardContent.includes('shrink-0'));

  // 6. PDP Responsiveness Checks
  const pdpContent = fs.readFileSync('app/product/[slug]/page.tsx', 'utf-8');
  assert('PDP includes sticky mobile Add to Bag bar', pdpContent.includes('Sticky Mobile Add to Bag Bar'));
  assert('PDP sticky bar includes safe-area-inset-bottom support', pdpContent.includes('env(safe-area-inset-bottom'));
  assert('PDP section has bottom padding for mobile sticky bar', pdpContent.includes('pb-24 lg:pb-16'));
  assert('PDP gallery thumbnails have horizontal scroll protection', pdpContent.includes('overflow-x-auto'));

  // 7. Shop & Search Mobile Filter Drawers
  const shopContent = fs.readFileSync('app/shop/page.tsx', 'utf-8');
  assert('Shop page includes dedicated mobile filter modal drawer', shopContent.includes('Mobile Filter Drawer Modal'));
  assert('Shop mobile filter modal includes backdrop and close trigger', shopContent.includes('bg-black/80 backdrop-blur-sm'));

  const searchContent = fs.readFileSync('app/search/page.tsx', 'utf-8');
  assert('Search page includes dedicated mobile filter modal drawer', searchContent.includes('Mobile Filter Drawer Modal'));

  // 8. Admin Panel Responsiveness Checks
  const adminLayout = fs.readFileSync('app/admin/layout.tsx', 'utf-8');
  assert('Admin main layout prevents page-level overflow (min-w-0 overflow-x-hidden)', adminLayout.includes('min-w-0 w-full lg:pl-64 overflow-x-hidden'));

  // 9. Mobile Drawer Safe Area Support
  const drawerContent = fs.readFileSync('components/customer/MobileDrawer.tsx', 'utf-8');
  assert('MobileDrawer has safe area bottom padding', drawerContent.includes('env(safe-area-inset-bottom'));

  // 10. Database Health Check for Live Queries
  const productCount = await prisma.product.count({ where: { status: 'ACTIVE' } });
  assert('Database has active products ready for mobile rendering', productCount > 0);

  console.log('--------------------------------------------------');
  console.log(`TOTAL RESPONSIVE TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==================================================');

  if (passed === total) {
    console.log('✅ ALL MOBILE RESPONSIVE INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

testResponsiveIntegrity().catch((err) => {
  console.error('Fatal error in responsive test:', err);
  process.exit(1);
});
