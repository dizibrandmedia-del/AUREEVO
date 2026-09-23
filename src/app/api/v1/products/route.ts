import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { invalidateCatalogCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "relevance";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const bestSeller = searchParams.get("bestSeller");

    const user = await getCurrentUser();
    const canSeeCost = user ? hasPermission(user.role, "canViewPurchaseCost") : false;

    // Build Prisma query where clause
    const where: any = {};

    // Filter by status if provided (and not 'ALL')
    if (status && status !== "ALL") {
      where.status = status;
    } else if (!status && (!user || user.role === "CUSTOMER")) {
      where.status = "PUBLISHED";
    }

    if (category) {
      where.category = { slug: category };
    }

    if (subcategory) {
      where.subcategory = { slug: subcategory };
    }

    if (brand) {
      const brandsList = brand.split(",");
      where.brand = { slug: { in: brandsList } };
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    if (featured === "true") where.isFeatured = true;
    if (trending === "true") where.isTrending = true;
    if (bestSeller === "true") where.isBestSeller = true;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { modelNumber: { contains: search } },
        { sku: { contains: search } },
        { shortDescription: { contains: search } },
        { brand: { name: { contains: search } } },
      ];
    }

    // Determine orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { sellingPrice: "asc" };
    else if (sort === "price-desc") orderBy = { sellingPrice: "desc" };
    else if (sort === "discount-desc") orderBy = { discountPercent: "desc" };
    else if (sort === "rating") orderBy = { createdAt: "desc" };

    const totalCount = await db.product.count({ where });

    const rawProducts = await db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Strip sensitive purchasePrice if user is unauthorized
    const products = rawProducts.map((p) => {
      const item: any = { ...p };
      if (!canSeeCost) {
        delete item.purchasePrice;
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      modelNumber,
      sku,
      categoryId,
      subcategoryId,
      brandId,
      shortDescription,
      fullDescription,
      mrp,
      purchasePrice,
      sellingPrice,
      discountPercent,
      gstPercent,
      stock,
      warrantyMonths,
      warrantyDetails,
      installationType,
      installationCost,
      deliveryChargeType,
      flatDeliveryCharge,
      images,
      attributes,
    } = body;

    if (!name || !categoryId || !subcategoryId || !brandId || !mrp || !sellingPrice) {
      return NextResponse.json(
        { error: "Missing required product fields." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const generatedSku = sku || `AUR-${Date.now().toString().slice(-6)}`;

    // Listing executives create with status SUBMITTED for admin approval
    // Admins can create with PUBLISHED directly
    const initialStatus =
      user.role === "LISTING_EXECUTIVE" ? "SUBMITTED" : "PUBLISHED";

    const product = await db.product.create({
      data: {
        name,
        slug: generatedSlug,
        modelNumber: modelNumber || null,
        sku: generatedSku,
        categoryId,
        subcategoryId,
        brandId,
        shortDescription,
        fullDescription,
        mrp: parseFloat(mrp),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
        sellingPrice: parseFloat(sellingPrice),
        discountPercent:
          discountPercent !== undefined
            ? parseFloat(discountPercent)
            : Math.round(((parseFloat(mrp) - parseFloat(sellingPrice)) / parseFloat(mrp)) * 100),
        gstPercent: gstPercent ? parseFloat(gstPercent) : 18,
        stock: stock ? parseInt(stock, 10) : 0,
        status: initialStatus,
        warrantyMonths: warrantyMonths ? parseInt(warrantyMonths, 10) : 12,
        warrantyDetails,
        installationType: installationType || "NOT_REQUIRED",
        installationCost: installationCost ? parseFloat(installationCost) : 0,
        deliveryChargeType: deliveryChargeType || "FREE",
        flatDeliveryCharge: flatDeliveryCharge ? parseFloat(flatDeliveryCharge) : 0,
        images: images && images.length > 0 ? {
          create: images.map((img: any, idx: number) => ({
            url: typeof img === "string" ? img : img.url,
            altText: typeof img === "object" ? img.altText : name,
            isPrimary: idx === 0,
            displayOrder: idx,
          })),
        } : undefined,
        attributes: attributes && attributes.length > 0 ? {
          create: attributes.map((attr: any) => ({
            attributeName: attr.attributeName,
            attributeValue: attr.attributeValue,
          })),
        } : undefined,
      },
      include: {
        images: true,
        attributes: true,
      },
    });

    try {
      invalidateCatalogCache();
      revalidatePath("/", "layout");
      revalidatePath("/deals");
      revalidatePath(`/category/${product.categoryId}`);
      revalidatePath("/admin/catalog/products");
    } catch (e) {}

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("Product creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
