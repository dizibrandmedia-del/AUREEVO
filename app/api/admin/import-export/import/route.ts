import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('data.import');
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'products';

    if (!file) {
      return errorResponse('No CSV file uploaded', 400);
    }

    const csvText = await file.text();

    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return errorResponse('Failed to parse CSV file', 400, parseResult.errors);
    }

    const rows = parseResult.data as Record<string, any>[];
    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    if (type === 'categories') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // header is row 1
        const name = row.Name || row.name;
        if (!name) {
          errors.push({ row: rowNumber, error: 'Category Name is missing' });
          continue;
        }

        const slug = slugify(row.Slug || row.slug || name);
        const description = row.Description || row.description || null;
        const status = row.Status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
          await prisma.category.upsert({
            where: { slug },
            update: { name, description, status },
            create: { name, slug, description, status },
          });
          successCount++;
        } catch (err: any) {
          errors.push({ row: rowNumber, error: err.message || 'Database insert error' });
        }
      }
    } else if (type === 'brands') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;
        const name = row.Name || row.name;
        if (!name) {
          errors.push({ row: rowNumber, error: 'Brand Name is missing' });
          continue;
        }

        const slug = slugify(row.Slug || row.slug || name);
        const website = row.Website || row.website || null;
        const description = row.Description || row.description || null;
        const status = row.Status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
          await prisma.brand.upsert({
            where: { slug },
            update: { name, website, description, status },
            create: { name, slug, website, description, status },
          });
          successCount++;
        } catch (err: any) {
          errors.push({ row: rowNumber, error: err.message || 'Database insert error' });
        }
      }
    } else if (type === 'products') {
      const defaultCategory = await prisma.category.findFirst();
      const defaultWarehouse = await prisma.warehouse.findFirst();

      if (!defaultCategory) {
        return errorResponse('No categories found in system. Create at least one category first.', 400);
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;
        const name = row.Name || row.name;
        const sku = row.SKU || row.sku;
        const price = parseFloat(row.SellingPrice || row.sellingPrice || row.Price || '0');
        const mrp = parseFloat(row.MRP || row.mrp || row.SellingPrice || '0');

        if (!name || !sku) {
          errors.push({ row: rowNumber, error: 'Product Name and SKU are required' });
          continue;
        }

        const slug = slugify(row.Slug || row.slug || name);

        // Find or fallback category
        let categoryId = defaultCategory.id;
        const catName = row.Category || row.category;
        if (catName) {
          const foundCat = await prisma.category.findFirst({
            where: { OR: [{ name: catName }, { slug: slugify(catName) }] },
          });
          if (foundCat) categoryId = foundCat.id;
        }

        // Find brand
        let brandId = null;
        const brandName = row.Brand || row.brand;
        if (brandName) {
          const foundBrand = await prisma.brand.findFirst({
            where: { OR: [{ name: brandName }, { slug: slugify(brandName) }] },
          });
          if (foundBrand) brandId = foundBrand.id;
        }

        try {
          const product = await prisma.product.upsert({
            where: { sku },
            update: {
              name,
              slug,
              sellingPrice: price,
              mrp,
              categoryId,
              brandId,
              status: row.Status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
              shortDescription: row.ShortDescription || row.shortDescription || null,
            },
            create: {
              name,
              sku,
              slug,
              sellingPrice: price,
              mrp,
              categoryId,
              brandId,
              productType: 'SIMPLE',
              status: row.Status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
              shortDescription: row.ShortDescription || row.shortDescription || null,
            },
          });

          // Create inventory if missing
          if (defaultWarehouse) {
            const existingInv = await prisma.inventory.findFirst({
              where: { productId: product.id, variantId: null, warehouseId: defaultWarehouse.id },
            });
            if (!existingInv) {
              await prisma.inventory.create({
                data: {
                  productId: product.id,
                  variantId: null,
                  warehouseId: defaultWarehouse.id,
                  currentStock: 0,
                  reservedStock: 0,
                  lowStockThreshold: 5,
                },
              });
            }
          }

          successCount++;
        } catch (err: any) {
          errors.push({ row: rowNumber, error: err.message || 'Database insert error' });
        }
      }
    } else {
      return errorResponse(`Import for type "${type}" is not supported yet`, 400);
    }

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'IMPORT_CSV',
      entity: type.toUpperCase(),
      metadata: { totalRows: rows.length, successCount, errorCount: errors.length },
    });

    return successResponse({
      message: `Import processed. ${successCount} successful, ${errors.length} errors.`,
      successCount,
      errors,
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return errorResponse('Failed to process CSV import', 500);
  }
}
