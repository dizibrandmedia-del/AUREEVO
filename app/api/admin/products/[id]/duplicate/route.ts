import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { logActivity } from '@/lib/activity-logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('products.duplicate');
  if (!auth.authorized) return auth.response;

  try {
    const original = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: true,
        productAttributes: true,
        inventories: true,
      },
    });

    if (!original) return errorResponse('Original product not found', 404);

    const timestamp = Date.now().toString().slice(-4);
    const newSku = `${original.sku}-COPY-${timestamp}`;
    const newSlug = `${original.slug}-copy-${timestamp}`;
    const newName = `${original.name} (Copy)`;

    const defaultWarehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });

    const duplicated = await prisma.$transaction(async (tx) => {
      const cloned = await tx.product.create({
        data: {
          name: newName,
          slug: newSlug,
          sku: newSku,
          brandId: original.brandId,
          categoryId: original.categoryId,
          productType: original.productType,
          status: 'DRAFT', // Cloned as Draft for safety
          shortDescription: original.shortDescription,
          description: original.description,
          highlights: original.highlights,
          benefits: original.benefits,
          specifications: original.specifications,
          ingredients: original.ingredients,
          howToUse: original.howToUse,
          mrp: original.mrp,
          sellingPrice: original.sellingPrice,
          discountPercent: original.discountPercent,
          taxRate: original.taxRate,
          images: original.images,
          videoUrl: original.videoUrl,
          isFeatured: false,
          tags: original.tags,
          metaTitle: original.metaTitle ? `${original.metaTitle} - Copy` : null,
          metaDescription: original.metaDescription,
        },
      });

      // Clone attributes
      for (const attr of original.productAttributes) {
        await tx.productAttribute.create({
          data: {
            productId: cloned.id,
            attributeId: attr.attributeId,
            attributeValueId: attr.attributeValueId,
            customValue: attr.customValue,
          },
        });
      }

      // Clone variants
      if (original.productType === 'VARIABLE' && original.variants.length > 0) {
        for (const v of original.variants) {
          const clonedVar = await tx.productVariant.create({
            data: {
              productId: cloned.id,
              sku: `${v.sku}-COPY-${timestamp}`,
              name: v.name,
              price: v.price,
              mrp: v.mrp,
              stock: 0,
              image: v.image,
              status: v.status,
              attributes: v.attributes,
            },
          });

          if (defaultWarehouse) {
            await tx.inventory.create({
              data: {
                productId: cloned.id,
                variantId: clonedVar.id,
                warehouseId: defaultWarehouse.id,
                currentStock: 0,
                reservedStock: 0,
                lowStockThreshold: 5,
              },
            });
          }
        }
      } else if (defaultWarehouse) {
        await tx.inventory.create({
          data: {
            productId: cloned.id,
            variantId: null,
            warehouseId: defaultWarehouse.id,
            currentStock: 0,
            reservedStock: 0,
            lowStockThreshold: 5,
          },
        });
      }

      return cloned;
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DUPLICATE',
      entity: 'Product',
      entityId: duplicated.id,
      metadata: { originalId: original.id, originalSku: original.sku, newSku: duplicated.sku },
    });

    return successResponse({ product: duplicated }, 201);
  } catch (error: any) {
    console.error('Duplicate product error:', error);
    return errorResponse('Failed to duplicate product', 500);
  }
}
