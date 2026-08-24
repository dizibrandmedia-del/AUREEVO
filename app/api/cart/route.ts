import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const CART_SESSION_COOKIE = 'aureevo_cart_session';

async function getOrCreateCart(req: NextRequest) {
  const customerSession = await getCustomerSession();
  const cookieStore = cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (customerSession && customerSession.user) {
    // Look for user cart
    let cart = await prisma.cart.findFirst({
      where: { userId: customerSession.user.id },
    });

    if (!cart) {
      // If there was a guest cart with sessionId, link it to the user
      if (sessionId) {
        const guestCart = await prisma.cart.findUnique({
          where: { sessionId },
        });
        if (guestCart) {
          cart = await prisma.cart.update({
            where: { id: guestCart.id },
            data: { userId: customerSession.user.id, sessionId: null },
          });
        }
      }

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: customerSession.user.id },
        });
      }
    }
    return { cart, setSessionCookie: null };
  }

  // Guest Cart
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
    });
  }

  return { cart, setSessionCookie: sessionId };
}

// GET /api/cart - Return computed cart
export async function GET(req: NextRequest) {
  try {
    const { cart, setSessionCookie } = await getOrCreateCart(req);

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            sellingPrice: true,
            mrp: true,
            taxRate: true,
            images: true,
            status: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            mrp: true,
            stock: true,
            image: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const settings = await prisma.adminSetting.findMany({
      where: { key: { in: ['free_shipping_threshold', 'standard_shipping_rate', 'default_tax_rate'] } },
    });
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));
    const freeShippingThreshold = parseFloat(settingsMap.get('free_shipping_threshold') || '5000');
    const standardShipping = parseFloat(settingsMap.get('standard_shipping_rate') || '350');

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let activeItemCount = 0;

    const activeItems: any[] = [];
    const savedItems: any[] = [];

    for (const item of cartItems) {
      if (item.product.status !== 'ACTIVE') continue;

      const unitPrice = item.variant ? item.variant.price : item.product.sellingPrice;
      const unitMrp = item.variant ? item.variant.mrp : item.product.mrp;
      const images = item.product.images ? JSON.parse(item.product.images) : [];
      const image = item.variant?.image || images[0] || '/images/aureevo-logo.png';
      const maxStock = item.variant ? item.variant.stock : 99;

      const itemPayload = {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productSlug: item.product.slug,
        variantName: item.variant?.name || null,
        sku: item.variant?.sku || item.product.sku,
        price: unitPrice,
        mrp: unitMrp,
        image,
        quantity: item.quantity,
        maxStock,
        isSavedForLater: item.isSavedForLater,
      };

      if (item.isSavedForLater) {
        savedItems.push(itemPayload);
      } else {
        activeItems.push(itemPayload);
        subtotal += unitPrice * item.quantity;
        if (unitMrp > unitPrice) {
          totalDiscount += (unitMrp - unitPrice) * item.quantity;
        }
        const taxRate = item.product.taxRate || 18.0;
        totalTax += (unitPrice * (taxRate / 100)) * item.quantity;
        activeItemCount += item.quantity;
      }
    }

    const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShipping;
    const total = subtotal + shipping;
    const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

    const response = successResponse({
      cartId: cart.id,
      items: activeItems,
      savedItems,
      summary: {
        subtotal,
        discount: totalDiscount,
        tax: Math.round(totalTax),
        shipping,
        total,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        itemCount: activeItemCount,
      },
    });

    if (setSessionCookie) {
      response.cookies.set(CART_SESSION_COOKIE, setSessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    return errorResponse('Failed to retrieve shopping bag', 500, err.message);
  }
}

// POST /api/cart - Add item to bag
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const qty = Math.max(1, parseInt(String(quantity), 10) || 1);

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        inventories: true,
      },
    });

    if (!product || product.status !== 'ACTIVE') {
      return errorResponse('Product is not available for purchase', 404);
    }

    // Validate variant if provided
    let variant: any = null;
    if (variantId) {
      variant = product.variants.find((v) => v.id === variantId);
      if (!variant || variant.status !== 'ACTIVE') {
        return errorResponse('Selected variant is currently unavailable', 400);
      }
      if (variant.stock < qty) {
        return errorResponse(`Only ${variant.stock} units available in stock`, 400);
      }
    } else if (product.productType === 'VARIABLE' && product.variants.length > 0) {
      // Auto-select first active variant if none selected
      variant = product.variants.find((v) => v.status === 'ACTIVE') || product.variants[0];
    }

    const { cart, setSessionCookie } = await getOrCreateCart(req);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variant ? variant.id : null,
        isSavedForLater: false,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      const maxAllowed = variant ? variant.stock : 99;
      if (newQty > maxAllowed) {
        return errorResponse(`Maximum stock reached (${maxAllowed} units available)`, 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variant ? variant.id : null,
          quantity: qty,
          isSavedForLater: false,
        },
      });
    }

    const response = successResponse({ message: 'Item added to luxury bag' });
    if (setSessionCookie) {
      response.cookies.set(CART_SESSION_COOKIE, setSessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }
    return response;
  } catch (err: any) {
    return errorResponse('Failed to add item to bag', 500, err.message);
  }
}

// PUT /api/cart - Update item quantity
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId) return errorResponse('Cart item ID required', 400);
    const newQty = parseInt(String(quantity), 10);

    if (newQty <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return successResponse({ message: 'Item removed from bag' });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { variant: true },
    });

    if (!item) return errorResponse('Cart item not found', 404);

    if (item.variant && item.variant.stock < newQty) {
      return errorResponse(`Only ${item.variant.stock} units available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQty },
    });

    return successResponse({ message: 'Quantity updated' });
  } catch (err: any) {
    return errorResponse('Failed to update quantity', 500, err.message);
  }
}

// DELETE /api/cart - Remove item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) return errorResponse('Cart item ID required', 400);

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return successResponse({ message: 'Item removed from bag' });
  } catch (err: any) {
    return errorResponse('Failed to remove item', 500, err.message);
  }
}
