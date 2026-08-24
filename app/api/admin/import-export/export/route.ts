import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, errorResponse } from '@/lib/api-response';
import Papa from 'papaparse';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth('data.export');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'products'; // 'products', 'categories', 'brands', 'inventory'

    let csvData = '';
    let filename = `aureevo-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'products') {
      const products = await prisma.product.findMany({
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
      });

      const formatted = products.map((p) => ({
        Name: p.name,
        SKU: p.sku,
        Slug: p.slug,
        Category: p.category.name,
        Brand: p.brand ? p.brand.name : '',
        ProductType: p.productType,
        Status: p.status,
        MRP: p.mrp,
        SellingPrice: p.sellingPrice,
        DiscountPercent: p.discountPercent,
        TaxRate: p.taxRate,
        ShortDescription: p.shortDescription || '',
        Ingredients: p.ingredients || '',
        CreatedAt: p.createdAt.toISOString(),
      }));

      csvData = Papa.unparse(formatted);
    } else if (type === 'categories') {
      const categories = await prisma.category.findMany({
        include: {
          parent: { select: { name: true } },
          _count: { select: { products: true } },
        },
      });

      const formatted = categories.map((c) => ({
        Name: c.name,
        Slug: c.slug,
        ParentCategory: c.parent ? c.parent.name : '',
        Description: c.description || '',
        SortOrder: c.sortOrder,
        Status: c.status,
        IsFeatured: c.isFeatured ? 'YES' : 'NO',
        ProductCount: c._count.products,
      }));

      csvData = Papa.unparse(formatted);
    } else if (type === 'brands') {
      const brands = await prisma.brand.findMany({
        include: { _count: { select: { products: true } } },
      });

      const formatted = brands.map((b) => ({
        Name: b.name,
        Slug: b.slug,
        Website: b.website || '',
        Description: b.description || '',
        Status: b.status,
        IsFeatured: b.isFeatured ? 'YES' : 'NO',
        ProductCount: b._count.products,
      }));

      csvData = Papa.unparse(formatted);
    } else if (type === 'inventory') {
      const inventory = await prisma.inventory.findMany({
        include: {
          product: { select: { name: true, sku: true } },
          variant: { select: { name: true, sku: true } },
          warehouse: { select: { name: true, code: true } },
        },
      });

      const formatted = inventory.map((inv) => ({
        ProductName: inv.product.name,
        SKU: inv.variant ? inv.variant.sku : inv.product.sku,
        VariantName: inv.variant ? inv.variant.name : 'Main Product',
        WarehouseCode: inv.warehouse.code,
        WarehouseName: inv.warehouse.name,
        CurrentStock: inv.currentStock,
        ReservedStock: inv.reservedStock,
        AvailableStock: inv.currentStock - inv.reservedStock,
        LowStockThreshold: inv.lowStockThreshold,
        LastUpdated: inv.updatedAt.toISOString(),
      }));

      csvData = Papa.unparse(formatted);
    } else {
      return errorResponse('Invalid export type requested', 400);
    }

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('CSV export error:', error);
    return errorResponse('Failed to generate export file', 500);
  }
}
