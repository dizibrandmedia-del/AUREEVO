import React from "react";
import { notFound } from "next/navigation";
import { getCachedProductBySlug, getCachedRelatedProducts } from "@/lib/cache";
import ProductDetailView from "@/components/storefront/ProductDetailView";

interface ProductPageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  const product = await getCachedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Strip purchasePrice
  const safeProduct: any = { ...product };
  delete safeProduct.purchasePrice;

  // Fetch related products from cache
  const related = await getCachedRelatedProducts(product.categoryId, product.id);

  const safeRelated = related.map((p) => {
    const item: any = { ...p };
    delete item.purchasePrice;
    return item;
  });

  return (
    <ProductDetailView product={safeProduct} relatedProducts={safeRelated} />
  );
}
