import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";

    const categories = await db.category.findMany({
      where: includeAll ? {} : { isActive: true },
      include: {
        subcategories: {
          where: includeAll ? {} : { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
        marginRule: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      isSubcategory,
      categoryId,
      name,
      slug,
      description,
      image,
      icon,
      displayOrder,
      defaultMarginPercent,
      otherCostPercent,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Handle Subcategory Creation
    if (isSubcategory || categoryId) {
      if (!categoryId) {
        return NextResponse.json({ error: "Parent categoryId is required for subcategory" }, { status: 400 });
      }

      const subcategory = await db.subcategory.create({
        data: {
          categoryId,
          name,
          slug: generatedSlug,
          description: description || null,
          image: image || null,
          displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        },
      });

      return NextResponse.json({ success: true, subcategory }, { status: 201 });
    }

    // Handle Category Creation
    const category = await db.category.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || null,
        image: image || null,
        icon: icon || null,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        marginRule: defaultMarginPercent
          ? {
              create: {
                defaultMarginPercent: parseFloat(defaultMarginPercent) || 15,
                otherCostPercent: parseFloat(otherCostPercent) || 3,
                minMarginPercent: (parseFloat(defaultMarginPercent) || 15) * 0.7,
              },
            }
          : undefined,
      },
      include: {
        marginRule: true,
        subcategories: true,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err: any) {
    console.error("Category creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      isSubcategory,
      name,
      slug,
      description,
      image,
      icon,
      displayOrder,
      isActive,
      defaultMarginPercent,
      otherCostPercent,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 });
    }

    // Handle Subcategory Update
    if (isSubcategory) {
      const updatedSub = await db.subcategory.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(image !== undefined ? { image } : {}),
          ...(displayOrder !== undefined ? { displayOrder: parseInt(displayOrder, 10) } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
      });

      return NextResponse.json({ success: true, subcategory: updatedSub });
    }

    // Handle Category Update
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(displayOrder !== undefined ? { displayOrder: parseInt(displayOrder, 10) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    // Update Margin Rule if provided
    if (defaultMarginPercent !== undefined || otherCostPercent !== undefined) {
      await db.categoryMarginRule.upsert({
        where: { categoryId: id },
        create: {
          categoryId: id,
          defaultMarginPercent: parseFloat(defaultMarginPercent) || 15,
          otherCostPercent: parseFloat(otherCostPercent) || 3,
          minMarginPercent: (parseFloat(defaultMarginPercent) || 15) * 0.7,
        },
        update: {
          ...(defaultMarginPercent !== undefined ? { defaultMarginPercent: parseFloat(defaultMarginPercent) } : {}),
          ...(otherCostPercent !== undefined ? { otherCostPercent: parseFloat(otherCostPercent) } : {}),
        },
      });
    }

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (err: any) {
    console.error("Category update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin privileges required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const isSubcategory = searchParams.get("isSubcategory") === "true";

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    if (isSubcategory) {
      // Check for associated products
      const count = await db.product.count({ where: { subcategoryId: id } });
      if (count > 0) {
        return NextResponse.json(
          { error: `Cannot delete subcategory: ${count} products are currently assigned to it. Reassign or delete them first.` },
          { status: 400 }
        );
      }

      await db.subcategory.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Subcategory deleted successfully" });
    }

    // Check for associated products in category
    const prodCount = await db.product.count({ where: { categoryId: id } });
    if (prodCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${prodCount} products are currently assigned to it. Reassign or delete them first.` },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (err: any) {
    console.error("Category deletion error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
