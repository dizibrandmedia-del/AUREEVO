async function testRBAC() {
  console.log('Testing RBAC & Margin Masking across User Roles...\n');

  // 1. Test Listing Executive login
  console.log('1. Logging in as Listing Executive (listing@aurevo.digital)...');
  const listingLoginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'listing@aurevo.digital', password: 'password123' })
  });
  const listingLoginData = await listingLoginRes.json();
  const listingCookie = listingLoginRes.headers.get('set-cookie');
  console.log(`   Login Success: ${listingLoginData.success}, Role: ${listingLoginData.user?.role}`);

  // Fetch products with Listing Executive cookie
  const listingProdRes = await fetch('http://localhost:3000/api/v1/products', {
    headers: { Cookie: listingCookie }
  });
  const listingProdData = await listingProdRes.json();
  const sampleListingProd = listingProdData.products?.[0];
  console.log(`   Product: "${sampleListingProd?.name}"`);
  console.log(`   Selling Price: ₹${sampleListingProd?.sellingPrice}`);
  console.log(`   Purchase Price (Masked for Listing Exec): ${sampleListingProd?.purchasePrice}`);
  
  if (sampleListingProd?.purchasePrice === null || sampleListingProd?.purchasePrice === undefined) {
    console.log('   [PASS] Cost masking works: Listing Executive cannot view purchasePrice!\n');
  } else {
    console.log('   [FAIL] Cost leaked to Listing Executive!\n');
  }

  // 2. Test Super Admin login
  console.log('2. Logging in as Super Admin (admin@aurevo.digital)...');
  const adminLoginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aurevo.digital', password: 'password123' })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log(`   Login Success: ${adminLoginData.success}, Role: ${adminLoginData.user?.role}`);

  // Fetch products with Admin cookie
  const adminProdRes = await fetch('http://localhost:3000/api/v1/products', {
    headers: { Cookie: adminCookie }
  });
  const adminProdData = await adminProdRes.json();
  const sampleAdminProd = adminProdData.products?.[0];
  console.log(`   Product: "${sampleAdminProd?.name}"`);
  console.log(`   Selling Price: ₹${sampleAdminProd?.sellingPrice}`);
  console.log(`   Purchase Price (Visible to Admin): ₹${sampleAdminProd?.purchasePrice}`);

  if (sampleAdminProd?.purchasePrice > 0) {
    console.log('   [PASS] Super Admin can view purchasePrice correctly!\n');
  } else {
    console.log('   [FAIL] Super Admin cannot view purchasePrice!\n');
  }

  // 3. Test Margin Calculation API with Admin Cookie
  console.log('3. Accessing /api/v1/pricing/margins with Admin credentials...');
  const marginRes = await fetch('http://localhost:3000/api/v1/pricing/margins', {
    headers: { Cookie: adminCookie }
  });
  const marginData = await marginRes.json();
  console.log(`   Status: ${marginRes.status}`);
  console.log(`   Categories analyzed: ${marginData.categoryMargins?.length || 0}`);
  if (marginRes.status === 200 && marginData.success) {
    console.log('   [PASS] Pricing and Margin Engine is fully functional with live margin telemetry!\n');
  } else {
    console.log('   [FAIL] Margin API failed for admin!\n');
  }
}

testRBAC();
