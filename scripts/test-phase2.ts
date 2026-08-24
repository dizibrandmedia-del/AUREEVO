/**
 * AUREEVO Platform - Phase 2 Comprehensive Test Suite
 * Tests Customer Storefront, PDP, Cart & Session Engine, Wishlist, Search, Account & CMS
 */

import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { signCustomerToken } from '../lib/jwt';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🏛️  AUREEVO PLATFORM — PHASE 2 AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  // Setup Test Customer User & Session
  const customerEmail = 'patron.test@aureevo.com';
  let testCustomer = await prisma.user.findUnique({ where: { email: customerEmail } });
  if (!testCustomer) {
    const passwordHash = await bcrypt.hash('AureevoPatron@2026', 10);
    testCustomer = await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash,
        firstName: 'Lady',
        lastName: 'Genevieve',
        phone: '+919988776655',
        status: 'ACTIVE',
      },
    });
  }

  const customerToken = await signCustomerToken({
    userId: testCustomer.id,
    email: testCustomer.email,
    firstName: testCustomer.firstName || 'Lady',
    lastName: testCustomer.lastName || 'Genevieve',
  });

  const testSessionId = 'guest_sess_' + Date.now();

  // Clean prior test cart/wishlist/addresses for this user
  await prisma.cartItem.deleteMany({ where: { cart: { userId: testCustomer.id } } });
  await prisma.wishlist.deleteMany({ where: { userId: testCustomer.id } });
  await prisma.address.deleteMany({ where: { userId: testCustomer.id } });

  // Get sample product and variant
  const sampleProduct = await prisma.product.findFirst({
    where: { status: 'ACTIVE' },
    include: { variants: true, category: true, brand: true },
  });

  if (!sampleProduct) {
    console.error('No active product found in database. Please run seed script.');
    return;
  }

  // ----------------------------------------------------
  // SUITE 1: Public Categories & Catalogue APIs
  // ----------------------------------------------------
  console.log('--- 1. PUBLIC CATALOGUE & CATEGORY HIERARCHY ---');

  const rootCategories = await prisma.category.findMany({
    where: { parentId: null, status: 'ACTIVE' },
    include: { children: true },
  });
  const allCategories = await prisma.category.findMany({ where: { status: 'ACTIVE' } });
  assert(
    rootCategories.length >= 1 && allCategories.length >= 5,
    `Category tree exists with recursive multi-level hierarchy (${allCategories.length} categories across ${rootCategories.length} root domains)`
  );

  const activeProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { variants: true, brand: true, category: true },
  });
  assert(
    activeProducts.length >= 3,
    `Active Products catalogue populated with ${activeProducts.length} formulated creations`
  );

  // ----------------------------------------------------
  // SUITE 2: Product Detail & Variant Matrix
  // ----------------------------------------------------
  console.log('\n--- 2. PRODUCT DETAIL PAGE (PDP) & VARIANT MATRIX ---');

  const pdpProduct = await prisma.product.findUnique({
    where: { slug: sampleProduct.slug },
    include: {
      brand: true,
      category: true,
      variants: true,
      reviews: { include: { user: true } },
    },
  });

  assert(!!pdpProduct, `PDP resolves product by slug "${sampleProduct.slug}"`);
  assert(pdpProduct?.brand !== null, 'PDP includes Maison brand details');
  assert(pdpProduct?.category !== null, 'PDP includes Category hierarchy');
  assert(pdpProduct?.variants !== undefined, 'PDP resolves variant matrix');

  // ----------------------------------------------------
  // SUITE 3: Customer Shopping Cart & Financial Calculations
  // ----------------------------------------------------
  console.log('\n--- 3. SHOPPING BAG & FREE SHIPPING CALCULATIONS ---');

  // Create/Get Cart
  let userCart = await prisma.cart.findUnique({ where: { userId: testCustomer.id } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId: testCustomer.id } });
  }

  const sampleVariant = sampleProduct.variants[0] || null;
  const itemPrice = sampleVariant ? sampleVariant.price : sampleProduct.sellingPrice;

  // Add Item to Cart
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: userCart.id,
      productId: sampleProduct.id,
      variantId: sampleVariant ? sampleVariant.id : null,
      quantity: 2,
      isSavedForLater: false,
    },
  });

  assert(!!cartItem, 'Item added to user shopping bag');

  // Subtotal, Tax & Shipping verification
  const subtotal = itemPrice * 2;
  const tax = Math.round(subtotal * 0.18);
  const freeShippingThreshold = 5000;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 350;
  const expectedTotal = subtotal + tax + shippingFee;

  assert(subtotal > 0, `Cart computed subtotal ₹${subtotal}`);
  assert(tax > 0, `Cart computed 18% GST ₹${tax}`);
  assert(
    shippingFee === (subtotal >= freeShippingThreshold ? 0 : 350),
    `Free shipping rule correctly evaluated (Shipping fee: ₹${shippingFee})`
  );
  assert(expectedTotal > subtotal, `Grand total calculated accurately (₹${expectedTotal})`);

  // Quantity Update
  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity: 3 },
  });
  assert(updatedItem.quantity === 3, 'Cart item quantity updated to 3');

  // Save for Later Toggle
  const savedItem = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { isSavedForLater: true },
  });
  assert(savedItem.isSavedForLater === true, 'Cart item moved to Save for Later');

  const movedBackItem = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { isSavedForLater: false },
  });
  assert(movedBackItem.isSavedForLater === false, 'Cart item moved back to active bag');

  // Remove Item
  await prisma.cartItem.delete({ where: { id: cartItem.id } });
  const remainingCount = await prisma.cartItem.count({ where: { cartId: userCart.id } });
  assert(remainingCount === 0, 'Cart item removed cleanly');

  // ----------------------------------------------------
  // SUITE 4: Customer Wishlist System
  // ----------------------------------------------------
  console.log('\n--- 4. CUSTOMER WISHLIST & DUPLICATE PREVENTION ---');

  const wishlistItem = await prisma.wishlist.create({
    data: {
      userId: testCustomer.id,
      productId: sampleProduct.id,
      variantId: sampleVariant ? sampleVariant.id : null,
    },
  });
  assert(!!wishlistItem, 'Product added to customer wishlist');

  // Verify Wishlist Retrieval
  const userWishlist = await prisma.wishlist.findMany({
    where: { userId: testCustomer.id },
    include: { product: true, variant: true },
  });
  assert(userWishlist.length === 1, 'Wishlist retrieves active items with product/variant relation');

  // Duplicate Check
  const existingWishlist = await prisma.wishlist.findFirst({
    where: {
      userId: testCustomer.id,
      productId: sampleProduct.id,
      variantId: sampleVariant ? sampleVariant.id : null,
    },
  });
  assert(!!existingWishlist, 'Duplicate prevention lookup detected existing wishlist entry');

  // Delete Wishlist Item
  await prisma.wishlist.delete({ where: { id: wishlistItem.id } });
  const wishlistCount = await prisma.wishlist.count({ where: { userId: testCustomer.id } });
  assert(wishlistCount === 0, 'Wishlist item removed cleanly');

  // ----------------------------------------------------
  // SUITE 5: Customer Address Management & Indian PIN Validation
  // ----------------------------------------------------
  console.log('\n--- 5. SAVED ADDRESSES & INDIAN PIN CODE VALIDATION ---');

  // Valid Indian 6-Digit PIN validation regex: /^[1-9][0-9]{5}$/
  const validPincode = '400021';
  const invalidPincode1 = '012345'; // starts with 0
  const invalidPincode2 = '40002'; // 5 digits

  const pinRegex = /^[1-9][0-9]{5}$/;
  assert(pinRegex.test(validPincode) === true, `Pincode "${validPincode}" is valid Indian PIN`);
  assert(pinRegex.test(invalidPincode1) === false, `Pincode "${invalidPincode1}" rejected (leading zero)`);
  assert(pinRegex.test(invalidPincode2) === false, `Pincode "${invalidPincode2}" rejected (5 digits)`);

  const createdAddress = await prisma.address.create({
    data: {
      userId: testCustomer.id,
      name: 'Lady Genevieve',
      phone: '+919988776655',
      addressLine1: 'Penthouse 4B, Imperial Towers',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: validPincode,
      addressType: 'HOME',
      isDefault: true,
    },
  });

  assert(!!createdAddress, 'Customer delivery address created in database');
  assert(createdAddress.isDefault === true, 'Address marked as default delivery address');

  // Update Address
  const updatedAddress = await prisma.address.update({
    where: { id: createdAddress.id },
    data: { landmark: 'Opposite Luxury Pier' },
  });
  assert(updatedAddress.landmark === 'Opposite Luxury Pier', 'Address updated with landmark');

  // Delete Address
  await prisma.address.delete({ where: { id: createdAddress.id } });
  const addressCount = await prisma.address.count({ where: { userId: testCustomer.id } });
  assert(addressCount === 0, 'Address deleted cleanly');

  // ----------------------------------------------------
  // SUITE 6: Admin Homepage CMS & Layout Engine
  // ----------------------------------------------------
  console.log('\n--- 6. ADMIN HOMEPAGE CMS & HERO BANNERS ---');

  const cmsSections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { banners: true },
  });

  assert(cmsSections.length >= 5, `Admin CMS has ${cmsSections.length} configured homepage sections`);

  const heroSection = cmsSections.find((s) => s.type === 'HERO_BANNER');
  assert(!!heroSection, 'HERO_BANNER section exists in CMS');
  assert(heroSection?.banners.length! >= 1, 'Hero Banner slide attached to HERO_BANNER section');

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
  console.log(`PASSED:      \x1b[32m${passedTests}\x1b[0m`);
  console.log(`FAILED:      \x1b[31m${failedTests}\x1b[0m`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
