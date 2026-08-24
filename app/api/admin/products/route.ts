import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { productSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth('products.view');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const status = searchParams.get('status');
    const productType = searchParams.get('productType');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;
    if (productType) where.productType = productType;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, logo: true } },
          variants: {
            select: { id: true, name: true, sku: true, price: true, mrp: true, stock: true, status: true },
          },
          inventories: {
            select: {
              id: true,
              currentStock: true,
              reservedStock: true,
              lowStockThreshold: true,
              warehouse: { select: { name: true, code: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return successResponse({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('products.create');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid product data', 400, parsed.error.format());
    }

    const data = parsed.data;
    const finalSlug = slugify(data.slug || data.name);

    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) return errorResponse('A product with this SKU already exists', 400);

    const existingSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) return errorResponse('A product with this URL slug already exists', 400);

    // Get default warehouse for initial inventory
    let defaultWarehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
    if (!defaultWarehouse) {
      defaultWarehouse = await prisma.warehouse.findFirst();
    }

    // Execute in transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: finalSlug,
          sku: data.sku,
          brandId: data.brandId || null,
          categoryId: data.categoryId,
          productType: data.productType,
          status: data.status,
          shortDescription: data.shortDescription,
          description: data.description,
          highlights: data.highlights ? JSON.stringify(data.highlights) : null,
          benefits: data.benefits ? JSON.stringify(data.benefits) : null,
          specifications: data.specifications ? JSON.stringify(data.specifications) : null,
          ingredients: data.ingredients,
          howToUse: data.howToUse,
          mrp: data.mrp,
          sellingPrice: data.sellingPrice,
          discountPercent: data.discountPercent,
          taxRate: data.taxRate,
          images: JSON.stringify(data.images || []),
          videoUrl: data.videoUrl,
          isFeatured: data.isFeatured,
          tags: JSON.stringify(data.tags || []),
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
      });

      // Insert Attributes
      if (data.attributes && data.attributes.length > 0) {
        for (const attr of data.attributes) {
          await tx.productAttribute.create({
            data: {
              productId: product.id,
              attributeId: attr.attributeId,
              attributeValueId: attr.attributeValueId || null,
              customValue: attr.customValue || null,
            },
          });
        }
      }

      // Handle Simple vs Variable product inventory
      if (data.productType === 'VARIABLE' && data.variants && data.variants.length > 0) {
        for (const variant of data.variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: variant.sku,
              name: variant.name,
              price: variant.price,
              mrp: variant.mrp,
              stock: variant.stock || 0,
              image: variant.image,
              status: variant.status,
              attributes: variant.attributes ? JSON.stringify(variant.attributes) : null,
            },
          });

          if (defaultWarehouse) {
            const inv = await tx.inventory.create({
              data: {
                productId: product.id,
                variantId: createdVariant.id,
                warehouseId: defaultWarehouse.id,
                currentStock: variant.stock || 0,
                reservedStock: 0,
                lowStockThreshold: 5,
              },
            });

            if ((variant.stock || 0) > 0) {
              await tx.stockHistory.create({
                data: {
                  inventoryId: inv.id,
                  productId: product.id,
                  variantId: createdVariant.id,
                  warehouseId: defaultWarehouse.id,
                  previousQty: 0,
                  newQty: variant.stock || 0,
                  diffQty: variant.stock || 0,
                  action: 'INITIAL',
                  reason: 'Initial stock intake during product creation',
                  adminUserId: auth.admin?.id,
                },
              });
            }
          }
        }
      } else {
        // Simple product stock
        const initialStock = data.initialStock || 0;
        if (defaultWarehouse) {
          const inv = await tx.inventory.create({
            data: {
              productId: product.id,
              variantId: null,
              warehouseId: defaultWarehouse.id,
              currentStock: initialStock,
              reservedStock: 0,
              lowStockThreshold: 5,
            },
          });

          if (initialStock > 0) {
            await tx.stockHistory.create({
              data: {
                inventoryId: inv.id,
                productId: product.id,
                variantId: null,
                warehouseId: defaultWarehouse.id,
                previousQty: 0,
                newQty: initialStock,
                diffQty: initialStock,
                action: 'INITIAL',
                reason: 'Initial stock intake during product creation',
                adminUserId: auth.admin?.id,
              },
            });
          }
        }
      }

      return product;
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'CREATE',
      entity: 'Product',
      entityId: newProduct.id,
      metadata: { name: newProduct.name, sku: newProduct.sku, type: newProduct.productType },
    });

    return successResponse({ product: newProduct }, 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    return errorResponse(error.message || 'Failed to create product', 500);
  }
}
