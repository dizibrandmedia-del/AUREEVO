import { prisma } from './prisma';
import { validateAndApplyCoupon } from './coupon-engine';

export interface CartItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface OrderCalculationOptions {
  items: CartItemInput[];
  couponCode?: string | null;
  deliveryMethod?: 'STANDARD' | 'EXPRESS' | 'WHITE_GLOVE';
  paymentMethod?: string;
  userId?: string | null;
  shippingPincode?: string;
}

export interface CalculatedItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;
  unitMrp: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  inStock: boolean;
  availableStock: number;
}

export interface OrderCalculationResult {
  items: CalculatedItem[];
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  retailDiscount: number;
  couponCode: string | null;
  couponDiscount: number;
  taxTotal: number;
  shippingFee: number;
  codCharges: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  grandTotal: number;
  currency: string;
  deliveryMethod: string;
  estimatedDays: string;
  isValid: boolean;
  validationErrors: string[];
}

export async function calculateOrderTotals(
  options: OrderCalculationOptions
): Promise<OrderCalculationResult> {
  const {
    items: inputItems,
    couponCode = null,
    deliveryMethod = 'STANDARD',
    paymentMethod = 'UPI',
    userId = null,
    shippingPincode = '400001',
  } = options;

  const validationErrors: string[] = [];
  const calculatedItems: CalculatedItem[] = [];

  if (!inputItems || inputItems.length === 0) {
    validationErrors.push('Shopping bag is empty');
  }

  // Load Shipping & Business Settings from DB
  const [shippingSetting, freeShippingSetting, taxSetting, codFeeSetting] =
    await Promise.all([
      prisma.adminSetting.findUnique({ where: { key: 'shipping_flat_rate' } }),
      prisma.adminSetting.findUnique({ where: { key: 'free_shipping_threshold' } }),
      prisma.adminSetting.findUnique({ where: { key: 'tax_gst_rate' } }),
      prisma.adminSetting.findUnique({ where: { key: 'cod_extra_charge' } }),
    ]);

  const defaultShippingFee = shippingSetting ? parseFloat(shippingSetting.value) : 350;
  const freeShippingThreshold = freeShippingSetting
    ? parseFloat(freeShippingSetting.value)
    : 5000;
  const defaultTaxRate = taxSetting ? parseFloat(taxSetting.value) : 18.0;
  const codExtraCharge = codFeeSetting ? parseFloat(codFeeSetting.value) : 100;

  let subtotal = 0;
  let mrpTotal = 0;
  let itemCount = 0;

  // Process Each Item against Live Database Records
  for (const input of inputItems) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: {
        variants: true,
        inventories: true,
        category: true,
        brand: true,
      },
    });

    if (!product || product.status !== 'ACTIVE') {
      validationErrors.push(`Product is no longer available in the catalogue`);
      continue;
    }

    let unitPrice = product.sellingPrice;
    let unitMrp = product.mrp || product.sellingPrice;
    let sku = product.sku;
    let variantName: string | null = null;
    let availableStock = product.inventories?.[0]?.currentStock || 0;

    if (input.variantId) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant || variant.status !== 'ACTIVE') {
        validationErrors.push(`Selected edition for "${product.name}" is no longer active`);
        continue;
      }
      unitPrice = variant.price;
      unitMrp = variant.mrp || variant.price;
      sku = variant.sku;
      variantName = variant.name;
      availableStock = variant.stock;
    }

    const inStock = availableStock >= input.quantity;
    if (!inStock) {
      validationErrors.push(
        `Insufficient reserve stock for "${product.name}${
          variantName ? ` (${variantName})` : ''
        }". Requested: ${input.quantity}, Available: ${availableStock}`
      );
    }

    const itemTotalPrice = unitPrice * input.quantity;
    const itemTaxAmount = Math.round(itemTotalPrice * (defaultTaxRate / 100));

    const images = product.images ? JSON.parse(product.images) : [];
    const image = images[0] || '/images/aureevo-logo.png';

    subtotal += itemTotalPrice;
    mrpTotal += unitMrp * input.quantity;
    itemCount += input.quantity;

    calculatedItems.push({
      productId: product.id,
      variantId: input.variantId || null,
      productName: product.name,
      variantName,
      sku,
      image,
      quantity: input.quantity,
      unitPrice,
      unitMrp,
      taxRate: defaultTaxRate,
      taxAmount: itemTaxAmount,
      totalPrice: itemTotalPrice,
      inStock,
      availableStock,
    });
  }

  const retailDiscount = Math.max(0, mrpTotal - subtotal);

  // Apply Coupon via Coupon Engine
  let couponDiscount = 0;
  let validatedCouponCode: string | null = null;

  if (couponCode && couponCode.trim()) {
    const couponResult = await validateAndApplyCoupon({
      code: couponCode.trim(),
      subtotal,
      items: calculatedItems,
      userId,
      paymentMethod,
    });

    if (couponResult.isValid) {
      couponDiscount = couponResult.discountAmount;
      validatedCouponCode = couponResult.code;
    } else {
      validationErrors.push(`Coupon Error: ${couponResult.error}`);
    }
  }

  // Evaluate Shipping Charges
  const isFreeShipping = subtotal >= freeShippingThreshold;
  let shippingFee = 0;

  if (deliveryMethod === 'WHITE_GLOVE') {
    shippingFee = isFreeShipping ? 0 : 500;
  } else if (deliveryMethod === 'EXPRESS') {
    shippingFee = 450;
  } else {
    // STANDARD
    shippingFee = isFreeShipping ? 0 : defaultShippingFee;
  }

  // COD Extra Surcharge if applicable
  let codCharges = 0;
  if (paymentMethod === 'COD') {
    codCharges = codExtraCharge;
  }

  // Tax calculation on post-discount base
  const taxableBase = Math.max(0, subtotal - couponDiscount);
  const taxTotal = Math.round(taxableBase * (defaultTaxRate / 100));

  const grandTotal = Math.max(0, taxableBase + taxTotal + shippingFee + codCharges);

  let estimatedDays = '2-4 Business Days';
  if (deliveryMethod === 'EXPRESS') estimatedDays = '24-36 Hours Express Dispatch';
  if (deliveryMethod === 'WHITE_GLOVE') estimatedDays = '1-2 Days White-Glove Courier';

  return {
    items: calculatedItems,
    itemCount,
    subtotal,
    mrpTotal,
    retailDiscount,
    couponCode: validatedCouponCode,
    couponDiscount,
    taxTotal,
    shippingFee,
    codCharges,
    freeShippingThreshold,
    isFreeShipping,
    grandTotal,
    currency: 'INR',
    deliveryMethod,
    estimatedDays,
    isValid: validationErrors.length === 0,
    validationErrors,
  };
}
