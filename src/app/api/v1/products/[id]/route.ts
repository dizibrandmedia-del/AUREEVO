import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    const canSeeCost = user ? hasPermission(user.role, "canViewPurchaseCost") : false;

    // Search by either ID or slug
    const product = await db.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
        reviews: {
          where: { isApproved: true },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        supplierProducts: canSeeCost
          ? {
              include: {
                supplier: {
                  select: { id: true, name: true, companyName: true, phone: true },
                },
              },
            }
          : false,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const responseItem: any = { ...product };
    if (!canSeeCost) {
      delete responseItem.purchasePrice;
    }

    // Fetch 4 related products from same category
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "PUBLISHED",
      },
      include: {
        brand: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 4,
    });

    return NextResponse.json({
      success: true,
      product: responseItem,
      relatedProducts: relatedProducts.map((p) => {
        const item: any = { ...p };
        if (!canSeeCost) delete item.purchasePrice;
        return item;
      }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const canManageCost = hasPermission(user.role, "canViewPurchaseCost");

    // Don't allow listing executive to modify purchasePrice
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;
    delete updateData.subcategory;
    delete updateData.brand;
    delete updateData.images;
    delete updateData.attributes;
    delete updateData.reviews;
    delete updateData.supplierProducts;
    delete updateData._count;

    // Parse numeric fields safely
    if (updateData.mrp !== undefined) updateData.mrp = parseFloat(updateData.mrp);
    if (updateData.sellingPrice !== undefined) updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    if (updateData.purchasePrice !== undefined) {
      if (canManageCost) {
        updateData.purchasePrice = parseFloat(updateData.purchasePrice);
      } else {
        delete updateData.purchasePrice;
      }
    }
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock, 10);
    if (updateData.discountPercent !== undefined) updateData.discountPercent = parseFloat(updateData.discountPercent);
    if (updateData.gstPercent !== undefined) updateData.gstPercent = parseFloat(updateData.gstPercent);
    if (updateData.warrantyMonths !== undefined) updateData.warrantyMonths = parseInt(updateData.warrantyMonths, 10);
    if (updateData.returnPolicyDays !== undefined) updateData.returnPolicyDays = parseInt(updateData.returnPolicyDays, 10);
    if (updateData.installationCost !== undefined) updateData.installationCost = parseFloat(updateData.installationCost);
    if (updateData.flatDeliveryCharge !== undefined) updateData.flatDeliveryCharge = parseFloat(updateData.flatDeliveryCharge);

    // Calculate discount automatically if both mrp and sellingPrice are present
    if (updateData.mrp && updateData.sellingPrice && updateData.discountPercent === undefined) {
      updateData.discountPercent = Math.max(0, Math.round(((updateData.mrp - updateData.sellingPrice) / updateData.mrp) * 100));
    }

    // Handle primary image update if an image URL was provided
    if (body.imageUrl) {
      const existingImg = await db.productImage.findFirst({
        where: { productId: id, isPrimary: true },
      });
      if (existingImg) {
        await db.productImage.update({
          where: { id: existingImg.id },
          data: { url: body.imageUrl },
        });
      } else {
        await db.productImage.create({
          data: {
            productId: id,
            url: body.imageUrl,
            altText: updateData.name || "Product image",
            isPrimary: true,
            displayOrder: 0,
          },
        });
      }
    }

    const updated = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("Product update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin authorization required" }, { status: 403 });
    }

    const { id } = params;

    // Check if order items exist
    const orderItemCount = await db.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
      return NextResponse.json({
        success: true,
        archived: true,
        message: `Product is linked to ${orderItemCount} order(s) and has been marked as ARCHIVED for reporting integrity.`,
      });
    }

    // Safely delete dependent records
    await db.productImage.deleteMany({ where: { productId: id } });
    await db.productAttribute.deleteMany({ where: { productId: id } });
    await db.review.deleteMany({ where: { productId: id } });
    await db.wishlistItem.deleteMany({ where: { productId: id } });
    await db.supplierProduct.deleteMany({ where: { productId: id } });

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Product deleted permanently." });
  } catch (err: any) {
    console.error("Product delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
