import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canBulkUpload")) {
      return NextResponse.json({ error: "Unauthorized for bulk upload" }, { status: 403 });
    }

    const body = await req.json();
    const { action, rows, items } = body; 
    // action: "VALIDATE" | "COMMIT_CREATE" | "BULK_UPDATE_PRICE" | "BULK_UPDATE_STOCK" | "BULK_STATUS"

    const dataToProcess = rows || items || [];

    if (action === "VALIDATE") {
      // Pre-fetch categories and brands for validation
      const categories = await db.category.findMany({ select: { id: true, name: true, slug: true } });
      const brands = await db.brand.findMany({ select: { id: true, name: true, slug: true } });

      const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
      const brandMap = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));

      const validatedRows = dataToProcess.map((row: any, idx: number) => {
        const errors: string[] = [];

        if (!row["Product Name"] && !row.name) {
          errors.push("Product Name is required");
        }

        const brandName = (row["Brand"] || row.brand || "").toLowerCase().trim();
        if (!brandName || !brandMap.has(brandName)) {
          errors.push(`Brand '${brandName}' not recognized in master catalog`);
        }

        const catName = (row["Category"] || row.category || "").toLowerCase().trim();
        if (!catName || !catMap.has(catName)) {
          errors.push(`Category '${catName}' not recognized in master catalog`);
        }

        const mrp = parseFloat(row["MRP"] || row.mrp || 0);
        const sellingPrice = parseFloat(row["Selling Price"] || row.sellingPrice || 0);
        if (isNaN(mrp) || mrp <= 0) {
          errors.push("Valid MRP is required");
        }
        if (isNaN(sellingPrice) || sellingPrice <= 0) {
          errors.push("Valid Selling Price is required");
        }
        if (sellingPrice > mrp) {
          errors.push("Selling Price cannot exceed MRP");
        }

        return {
          rowNumber: idx + 1,
          data: row,
          isValid: errors.length === 0,
          errors,
        };
      });

      const totalValid = validatedRows.filter((r: any) => r.isValid).length;
      const totalErrors = validatedRows.length - totalValid;

      return NextResponse.json({
        success: true,
        summary: {
          totalRows: validatedRows.length,
          totalValid,
          totalErrors,
        },
        rows: validatedRows,
      });
    }

    if (action === "COMMIT_CREATE") {
      const categories = await db.category.findMany({
        include: { subcategories: { take: 1 } },
      });
      const brands = await db.brand.findMany();

      const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
      const brandMap = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));

      let createdCount = 0;
      for (const row of dataToProcess) {
        const name = row["Product Name"] || row.name;
        const brandName = (row["Brand"] || row.brand || "").toLowerCase().trim();
        const catName = (row["Category"] || row.category || "").toLowerCase().trim();
        const mrp = parseFloat(row["MRP"] || row.mrp || 0);
        const sellingPrice = parseFloat(row["Selling Price"] || row.sellingPrice || 0);
        const purchasePrice = parseFloat(row["Purchase Price"] || row.purchasePrice || 0);
        const stock = parseInt(row["Stock"] || row.stock || 10, 10);
        const model = row["Model"] || row.modelNumber || null;
        const sku = row["SKU"] || row.sku || `AUR-BLK-${Date.now().toString().slice(-6)}-${createdCount}`;
        const imageUrl = row["Image URL"] || row.image || "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800";

        const category = catMap.get(catName);
        const brandId = brandMap.get(brandName);

        if (category && brandId && name && mrp && sellingPrice) {
          const subcategoryId = category.subcategories[0]?.id;
          if (subcategoryId) {
            const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
            await db.product.create({
              data: {
                name,
                slug,
                modelNumber: model,
                sku,
                categoryId: category.id,
                subcategoryId,
                brandId,
                mrp,
                sellingPrice,
                purchasePrice: hasPermission(user.role, "canViewPurchaseCost") ? purchasePrice : 0,
                stock,
                status: user.role === "LISTING_EXECUTIVE" ? "SUBMITTED" : "PUBLISHED",
                images: {
                  create: [{ url: imageUrl, isPrimary: true, displayOrder: 0 }],
                },
              },
            });
            createdCount++;
          }
        }
      }

      await logAudit("BULK_CREATE", "PRODUCT", undefined, { count: createdCount }, user.id, user.name);

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${createdCount} products.`,
        createdCount,
      });
    }

    if (action === "BULK_UPDATE_STOCK" || action === "BULK_UPDATE_PRICE") {
      let updatedCount = 0;
      for (const item of dataToProcess) {
        if (item.id) {
          const updateData: any = {};
          if (action === "BULK_UPDATE_STOCK" && item.stock !== undefined) {
            updateData.stock = parseInt(item.stock, 10);
          }
          if (action === "BULK_UPDATE_PRICE" && item.sellingPrice !== undefined) {
            updateData.sellingPrice = parseFloat(item.sellingPrice);
          }
          await db.product.update({
            where: { id: item.id },
            data: updateData,
          });
          updatedCount++;
        }
      }

      await logAudit(action, "PRODUCT", undefined, { count: updatedCount }, user.id, user.name);

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${updatedCount} products.`,
        updatedCount,
      });
    }

    return NextResponse.json({ error: "Invalid action requested" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
