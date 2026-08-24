import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { productSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('products.view');
  if (!auth.authorized) return auth.response;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            inventories: {
              include: { warehouse: true },
            },
          },
        },
        productAttributes: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
        inventories: {
          include: { warehouse: true },
        },
      },
    });

    if (!product) return errorResponse('Product not found', 404);

    return successResponse({ product });
  } catch (error) {
    return errorResponse('Failed to fetch product', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('products.edit');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid product data', 400, parsed.error.format());
    }

    const data = parsed.data;
    const finalSlug = slugify(data.slug || data.name);

    const existingSku = await prisma.product.findFirst({
      where: { sku: data.sku, NOT: { id: params.id } },
    });
    if (existingSku) return errorResponse('Another product with this SKU already exists', 400);

    const existingSlug = await prisma.product.findFirst({
      where: { slug: finalSlug, NOT: { id: params.id } },
    });
    if (existingSlug) return errorResponse('Another product with this slug already exists', 400);

    let defaultWarehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
    if (!defaultWarehouse) {
      defaultWarehouse = await prisma.warehouse.findFirst();
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: params.id },
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

      // Refresh attributes
      await tx.productAttribute.deleteMany({ where: { productId: params.id } });
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

      // Handle variable variants update
      if (data.productType === 'VARIABLE' && data.variants) {
        const incomingVariantIds: string[] = [];

        for (const v of data.variants) {
          if (v.id) {
            incomingVariantIds.push(v.id);
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                sku: v.sku,
                price: v.price,
                mrp: v.mrp,
                stock: v.stock,
                image: v.image,
                status: v.status,
                attributes: v.attributes ? JSON.stringify(v.attributes) : null,
              },
            });
          } else {
            const newVar = await tx.productVariant.create({
              data: {
                productId: product.id,
                sku: v.sku,
                name: v.name,
                price: v.price,
                mrp: v.mrp,
                stock: v.stock || 0,
                image: v.image,
                status: v.status,
                attributes: v.attributes ? JSON.stringify(v.attributes) : null,
              },
            });
            incomingVariantIds.push(newVar.id);

            if (defaultWarehouse) {
              await tx.inventory.create({
                data: {
                  productId: product.id,
                  variantId: newVar.id,
                  warehouseId: defaultWarehouse.id,
                  currentStock: v.stock || 0,
                  reservedStock: 0,
                  lowStockThreshold: 5,
                },
              });
            }
          }
        }

        // Delete removed variants
        await tx.productVariant.deleteMany({
          where: {
            productId: params.id,
            NOT: { id: { in: incomingVariantIds } },
          },
        });
      }

      return product;
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'UPDATE',
      entity: 'Product',
      entityId: updatedProduct.id,
      metadata: { name: updatedProduct.name, sku: updatedProduct.sku },
    });

    return successResponse({ product: updatedProduct });
  } catch (error: any) {
    console.error('Update product error:', error);
    return errorResponse(error.message || 'Failed to update product', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('products.delete');
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { name: true, sku: true },
    });

    if (!existing) return errorResponse('Product not found', 404);

    await prisma.product.delete({
      where: { id: params.id },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE',
      entity: 'Product',
      entityId: params.id,
      metadata: { name: existing.name, sku: existing.sku },
    });

    return successResponse({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return errorResponse('Failed to delete product', 500);
  }
}
