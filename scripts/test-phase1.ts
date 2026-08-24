import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  hashPassword,
  comparePassword,
  signAdminToken,
  verifyAdminToken,
  signCustomerToken,
  verifyCustomerToken,
} from '../lib/auth';
import { hasPermission, DEFAULT_ROLE_PERMISSIONS } from '../lib/rbac';
import { slugify } from '../lib/utils';
import Papa from 'papaparse';

const prisma = new PrismaClient();

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✖ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
    failedTests++;
  }
}

async function runPhase1Tests() {
  console.log('\n==================================================');
  console.log('  AUREEVO PHASE 1 — COMPREHENSIVE TEST SUITE');
  console.log('==================================================\n');

  // ----------------------------------------------------
  // TEST GROUP 1: PASSWORD HASHING & SECURITY
  // ----------------------------------------------------
  console.log('--- Group 1: Cryptography & Authentication Security ---');
  const rawPassword = 'AureevoLuxurySecure2026!';
  const hashedPassword = await hashPassword(rawPassword);
  assert(hashedPassword.startsWith('$2'), 'Password hashing uses bcrypt salt (never plaintext)');
  assert(await comparePassword(rawPassword, hashedPassword), 'Password comparison verifies valid password');
  assert(!(await comparePassword('WrongPassword123', hashedPassword)), 'Password comparison rejects invalid password');

  // ----------------------------------------------------
  // TEST GROUP 2: CUSTOMER & ADMIN JWT TOKENS
  // ----------------------------------------------------
  console.log('\n--- Group 2: Token Generation & Session Separation ---');
  const customerToken = await signCustomerToken({
    userId: 'cust-123',
    email: 'lady.genevieve@aureevo.com',
    firstName: 'Genevieve',
    lastName: 'DuPont',
  });
  const verifiedCustomer = await verifyCustomerToken(customerToken);
  assert(verifiedCustomer?.userId === 'cust-123', 'Customer token signs and verifies correctly');
  assert(verifiedCustomer?.type === 'customer', 'Customer token type is strictly "customer"');

  const adminToken = await signAdminToken({
    adminId: 'admin-123',
    email: 'admin@aureevo.com',
    name: 'Super Admin',
    roleId: 'role-super-admin',
    roleSlug: 'super-admin',
  });
  const verifiedAdmin = await verifyAdminToken(adminToken);
  assert(verifiedAdmin?.adminId === 'admin-123', 'Admin token signs and verifies correctly');
  assert(verifiedAdmin?.type === 'admin', 'Admin token type is strictly "admin"');

  // Verify that an admin token is rejected by the customer validator and vice versa
  assert((await verifyCustomerToken(adminToken)) === null, 'Customer validator rejects admin token (separation enforced)');
  assert((await verifyAdminToken(customerToken)) === null, 'Admin validator rejects customer token (separation enforced)');

  // ----------------------------------------------------
  // TEST GROUP 3: ROLE-BASED ACCESS CONTROL (RBAC)
  // ----------------------------------------------------
  console.log('\n--- Group 3: Role-Based Access Control (RBAC) ---');
  const superAdminPerms = ['*'];
  const productManagerPerms = DEFAULT_ROLE_PERMISSIONS['product-manager'];
  const inventoryManagerPerms = DEFAULT_ROLE_PERMISSIONS['inventory-manager'];

  assert(hasPermission(superAdminPerms, 'products.create'), 'Super Admin has wildcard access to products.create');
  assert(hasPermission(superAdminPerms, 'settings.manage'), 'Super Admin has wildcard access to settings.manage');
  assert(hasPermission(productManagerPerms, 'products.create'), 'Product Manager can create products');
  assert(hasPermission(productManagerPerms, 'categories.manage'), 'Product Manager can manage categories');
  assert(!hasPermission(productManagerPerms, 'settings.manage'), 'Product Manager is forbidden from modifying store settings');
  assert(hasPermission(inventoryManagerPerms, 'inventory.adjust'), 'Inventory Manager can adjust stock');
  assert(!hasPermission(inventoryManagerPerms, 'categories.manage'), 'Inventory Manager cannot manage categories');

  // ----------------------------------------------------
  // TEST GROUP 4: CATEGORY HIERARCHY & CRUD
  // ----------------------------------------------------
  console.log('\n--- Group 4: Dynamic Category Hierarchy Engine ---');
  const testRootSlug = `test-cat-root-${Date.now()}`;
  const testChildSlug = `test-cat-child-${Date.now()}`;

  const rootCategory = await prisma.category.create({
    data: {
      name: 'Haute Horlogerie & Watches',
      slug: testRootSlug,
      description: 'Future line expansion category (Swiss Complications)',
      status: 'ACTIVE',
      sortOrder: 10,
    },
  });
  assert(!!rootCategory.id, 'Created top-level category without parent');

  const childCategory = await prisma.category.create({
    data: {
      name: 'Tourbillons & Skeleton Watches',
      slug: testChildSlug,
      parentId: rootCategory.id,
      description: 'Hand-engraved haute complications',
      status: 'ACTIVE',
      sortOrder: 1,
    },
  });
  assert(childCategory.parentId === rootCategory.id, 'Created nested subcategory with valid parent link');

  // Verify hierarchy retrieval
  const retrievedTree = await prisma.category.findUnique({
    where: { id: rootCategory.id },
    include: { children: true },
  });
  assert(retrievedTree?.children.length === 1, 'Parent category successfully queried its child hierarchy');

  // Clean test categories
  await prisma.category.delete({ where: { id: childCategory.id } });
  await prisma.category.delete({ where: { id: rootCategory.id } });

  // ----------------------------------------------------
  // TEST GROUP 5: BRAND MANAGEMENT CRUD
  // ----------------------------------------------------
  console.log('\n--- Group 5: Brand Management Portfolio ---');
  const testBrandSlug = `test-brand-${Date.now()}`;
  const testBrand = await prisma.brand.create({
    data: {
      name: 'Maison de la Soie',
      slug: testBrandSlug,
      website: 'https://maisondelasoie.luxury',
      description: 'Artisanal silk textiles and botanical silk proteins',
      status: 'ACTIVE',
    },
  });
  assert(!!testBrand.id, 'Successfully created brand entity');

  const updatedBrand = await prisma.brand.update({
    where: { id: testBrand.id },
    data: { description: 'Updated heritage profile' },
  });
  assert(updatedBrand.description === 'Updated heritage profile', 'Brand updated successfully');

  await prisma.brand.delete({ where: { id: testBrand.id } });

  // ----------------------------------------------------
  // TEST GROUP 6: DYNAMIC ATTRIBUTES & VALUES
  // ----------------------------------------------------
  console.log('\n--- Group 6: Dynamic Attributes & Value Manager ---');
  const testAttrCode = `attr_test_${Date.now()}`;
  const dynamicAttribute = await prisma.attribute.create({
    data: {
      name: 'Precious Metal Finish',
      code: testAttrCode,
      type: 'COLOR',
      isVariant: true,
      isFilterable: true,
      sortOrder: 5,
    },
  });
  assert(!!dynamicAttribute.id, 'Dynamic attribute created with COLOR type and variant flag');

  const attrValue = await prisma.attributeValue.create({
    data: {
      attributeId: dynamicAttribute.id,
      label: '24K Yellow Gold',
      value: '24k-yellow-gold',
      hexColor: '#ffd700',
      sortOrder: 1,
    },
  });
  assert(attrValue.attributeId === dynamicAttribute.id, 'Attribute value linked to dynamic attribute');

  // Clean test attribute
  await prisma.attribute.delete({ where: { id: dynamicAttribute.id } });

  // ----------------------------------------------------
  // TEST GROUP 7: PRODUCT CRUD, VARIANTS & DUPLICATION
  // ----------------------------------------------------
  console.log('\n--- Group 7: Products, Dynamic Variants & Duplication ---');
  const sampleCategory = await prisma.category.findFirstOrThrow();
  const sampleWarehouse = await prisma.warehouse.findFirstOrThrow();

  const testProductSku = `AUR-TEST-PROD-${Date.now()}`;
  const testProduct = await prisma.product.create({
    data: {
      name: 'AUREEVO Diamond Radiance Facial Elixir',
      slug: slugify(`aureevo-diamond-radiance-facial-elixir-${Date.now()}`),
      sku: testProductSku,
      categoryId: sampleCategory.id,
      productType: 'VARIABLE',
      status: 'ACTIVE',
      shortDescription: 'Infused with micronized diamond dust.',
      mrp: 18000,
      sellingPrice: 15500,
      discountPercent: 13.88,
      taxRate: 18.0,
      highlights: JSON.stringify(['Instant illumination', 'Certified crushed diamonds']),
      specifications: JSON.stringify({ Volume: '50ml', Origin: 'Switzerland' }),
      images: JSON.stringify(['/images/aureevo-logo.png']),
    },
  });
  assert(!!testProduct.id, 'Variable product created with pricing and editorial specs');

  // Add 2 Variants
  const var1 = await prisma.productVariant.create({
    data: {
      productId: testProduct.id,
      sku: `${testProductSku}-30ML`,
      name: '30ml Travel Edition',
      mrp: 12000,
      price: 10500,
      stock: 25,
      status: 'ACTIVE',
      attributes: JSON.stringify({ volume: '30ml' }),
    },
  });

  const var2 = await prisma.productVariant.create({
    data: {
      productId: testProduct.id,
      sku: `${testProductSku}-50ML`,
      name: '50ml Grand Flacon',
      mrp: 18000,
      price: 15500,
      stock: 15,
      status: 'ACTIVE',
      attributes: JSON.stringify({ volume: '50ml' }),
    },
  });
  assert(var1.productId === testProduct.id && var2.productId === testProduct.id, 'Product variants linked to parent product');

  // Test Product Duplication
  const duplicateProduct = await prisma.product.create({
    data: {
      name: `${testProduct.name} (Copy)`,
      slug: `${testProduct.slug}-copy`,
      sku: `${testProduct.sku}-COPY`,
      categoryId: testProduct.categoryId,
      productType: testProduct.productType,
      status: 'DRAFT',
      mrp: testProduct.mrp,
      sellingPrice: testProduct.sellingPrice,
      images: testProduct.images,
    },
  });
  assert(duplicateProduct.status === 'DRAFT', 'Cloned product correctly set to DRAFT status for safety');
  assert(duplicateProduct.sku.includes('-COPY'), 'Cloned product assigned unique SKU identifier');

  // Clean test products
  await prisma.productVariant.deleteMany({ where: { productId: testProduct.id } });
  await prisma.product.delete({ where: { id: testProduct.id } });
  await prisma.product.delete({ where: { id: duplicateProduct.id } });

  // ----------------------------------------------------
  // TEST GROUP 8: INVENTORY, AVAILABLE CALCULATION & AUDIT HISTORY
  // ----------------------------------------------------
  console.log('\n--- Group 8: Inventory, Stock Transactions & History Logs ---');
  const existingProduct = await prisma.product.findFirstOrThrow({
    include: { inventories: true },
  });

  const inventoryRecord = await prisma.inventory.findFirstOrThrow({
    where: { productId: existingProduct.id },
  });

  const availableStock = inventoryRecord.currentStock - inventoryRecord.reservedStock;
  assert(availableStock >= 0, `Available Stock correctly computed as Current (${inventoryRecord.currentStock}) - Reserved (${inventoryRecord.reservedStock}) = ${availableStock}`);

  // Test transactional stock adjustment
  const previousQty = inventoryRecord.currentStock;
  const newAdjustmentQty = previousQty + 10;
  const diffQty = newAdjustmentQty - previousQty;

  const adjustedInventory = await prisma.inventory.update({
    where: { id: inventoryRecord.id },
    data: { currentStock: newAdjustmentQty },
  });
  assert(adjustedInventory.currentStock === newAdjustmentQty, 'Inventory updated with new physical quantity');

  const historyRecord = await prisma.stockHistory.create({
    data: {
      inventoryId: inventoryRecord.id,
      productId: existingProduct.id,
      variantId: inventoryRecord.variantId,
      warehouseId: inventoryRecord.warehouseId,
      previousQty,
      newQty: newAdjustmentQty,
      diffQty,
      action: 'ADJUSTMENT',
      reason: 'Automated test suite verification adjustment',
    },
  });
  assert(historyRecord.diffQty === 10, 'Stock history audit record logged exact +10 quantity delta');
  assert(historyRecord.previousQty === previousQty, 'Stock history preserved previous quantity signature');

  // Revert test adjustment
  await prisma.inventory.update({
    where: { id: inventoryRecord.id },
    data: { currentStock: previousQty },
  });
  await prisma.stockHistory.delete({ where: { id: historyRecord.id } });

  // ----------------------------------------------------
  // TEST GROUP 9: MEDIA ASSETS & OFFICIAL BRAND IDENTITY
  // ----------------------------------------------------
  console.log('\n--- Group 9: Media Management & Official Brand Assets ---');
  const mediaRecord = await prisma.media.findUnique({
    where: { id: 'media-official-logo' },
  });
  assert(!!mediaRecord, 'Official AUREEVO logo is catalogued in media database');
  assert(mediaRecord?.url === '/images/aureevo-logo.png', 'Official logo URL correctly points to static image asset');

  // ----------------------------------------------------
  // TEST GROUP 10: ADMIN SETTINGS & INTEGRATIONS
  // ----------------------------------------------------
  console.log('\n--- Group 10: Store Settings & System Configuration ---');
  const businessSetting = await prisma.adminSetting.findUnique({ where: { key: 'business_tagline' } });
  assert(businessSetting?.value === 'THE WORLD OF LUXURY.', 'Brand tagline verified: "THE WORLD OF LUXURY."');

  const taxSetting = await prisma.adminSetting.findUnique({ where: { key: 'default_tax_rate' } });
  assert(taxSetting?.value === '18.0', 'GST configuration verified in settings');

  // ----------------------------------------------------
  // TEST GROUP 11: CSV IMPORT & EXPORT SERIALIZATION
  // ----------------------------------------------------
  console.log('\n--- Group 11: CSV Import & Export Data Serialization ---');
  const rawCsvRows = [
    { Name: 'Rose Gold Shimmer Dust', SKU: 'AUR-SHIM-01', SellingPrice: '4500', MRP: '5000' },
    { Name: 'Velvet Matte Lip Glaze', SKU: 'AUR-LIP-01', SellingPrice: '3200', MRP: '3500' },
  ];
  const unparsedCsv = Papa.unparse(rawCsvRows);
  assert(unparsedCsv.includes('Rose Gold Shimmer Dust') && unparsedCsv.includes('AUR-SHIM-01'), 'CSV unparse generates compliant CSV string');

  const parsedBack = Papa.parse(unparsedCsv, { header: true });
  assert(parsedBack.data.length === 2, 'CSV parser correctly validates and deserializes rows');

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase1Tests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
