import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import { Search, ChevronRight } from "lucide-react";

interface SearchPageProps {
  searchParams: {
    q?: string;
    sort?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  const where: any = {
    status: "PUBLISHED",
  };

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { modelNumber: { contains: query } },
      { sku: { contains: query } },
      { shortDescription: { contains: query } },
      { brand: { name: { contains: query } } },
      { category: { name: { contains: query } } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (searchParams.sort === "price-asc") orderBy = { sellingPrice: "asc" };
  if (searchParams.sort === "price-desc") orderBy = { sellingPrice: "desc" };
  if (searchParams.sort === "discount") orderBy = { discountPercent: "desc" };

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: { orderBy: { displayOrder: "asc" } },
      attributes: true,
    },
    orderBy,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-blue">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Search Results</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-brand-blue" />
            {query ? `Search results for "${query}"` : "Explore All Products"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Found <strong>{products.length}</strong> matching models & appliances
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Sort:</span>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&sort=price-asc`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-blue"
          >
            Price: Low to High
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&sort=price-desc`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-blue"
          >
            Price: High to Low
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&sort=discount`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-blue"
          >
            Discount
          </Link>
        </div>
      </div>

      {/* Results Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <p className="text-sm font-semibold text-slate-700">No products found matching "{query}".</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with broader terms like "TV", "AC", "Fridge", "Bed", or browse by category.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["Smart TV", "Split AC", "Double Door Refrigerator", "King Bed", "Microwave"].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-brand-blue rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
