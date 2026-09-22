import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductDetailView from "@/components/storefront/ProductDetailView";

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  const product = await db.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: "PUBLISHED",
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: { orderBy: { displayOrder: "asc" } },
      attributes: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Strip purchasePrice
  const safeProduct: any = { ...product };
  delete safeProduct.purchasePrice;

  // Fetch related products
  const related = await db.product.findMany({
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

  const safeRelated = related.map((p) => {
    const item: any = { ...p };
    delete item.purchasePrice;
    return item;
  });

  return (
    <ProductDetailView product={safeProduct} relatedProducts={safeRelated} />
  );
}
