import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import { Filter, SlidersHorizontal, ChevronRight, HelpCircle } from "lucide-react";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: {
    sub?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = params;

  // Slug alias mappings to support any colloquial, plural, or shorthand URL
  const ALIAS_MAP: Record<string, { categorySlug: string; subSlug?: string }> = {
    appliances: { categorySlug: "kitchen-appliances" },
    kitchen: { categorySlug: "kitchen-appliances" },
    "audio-video": { categorySlug: "electronics", subSlug: "soundbars-home-theatre" },
    "smart-home": { categorySlug: "home-living", subSlug: "lighting-lamps" },
    "personal-care": { categorySlug: "electronics" },
    smartphones: { categorySlug: "electronics" },
    laptops: { categorySlug: "electronics" },
    "air-conditioners": { categorySlug: "ac-cooling", subSlug: "split-inverter-acs" },
    refrigerators: { categorySlug: "refrigeration", subSlug: "double-door-refrigerators" },
    televisions: { categorySlug: "electronics", subSlug: "led-smart-tvs" },
    "smart-lighting": { categorySlug: "home-living", subSlug: "lighting-lamps" },
    dishwashers: { categorySlug: "kitchen-appliances" },
    "grooming-kits": { categorySlug: "electronics" },
    "washing-machines": { categorySlug: "washing-cleaning", subSlug: "front-load-washing-machines" },
  };

  let targetCategorySlug = slug;
  let activeSubSlug = searchParams.sub;

  if (ALIAS_MAP[slug]) {
    targetCategorySlug = ALIAS_MAP[slug].categorySlug;
    if (!activeSubSlug && ALIAS_MAP[slug].subSlug) {
      activeSubSlug = ALIAS_MAP[slug].subSlug;
    }
  }

  // 1. Fetch Category by slug
  let category = await db.category.findUnique({
    where: { slug: targetCategorySlug },
    include: {
      subcategories: true,
    },
  });

  // 2. If not found, check if slug is a direct Subcategory slug
  if (!category) {
    const subcategory = await db.subcategory.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            subcategories: true,
          },
        },
      },
    });

    if (subcategory) {
      category = subcategory.category;
      activeSubSlug = subcategory.slug;
    }
  }

  if (!category) {
    notFound();
  }

  // Build query filter
  const where: any = {
    categoryId: category.id,
    status: "PUBLISHED",
  };

  if (activeSubSlug) {
    where.subcategory = { slug: activeSubSlug };
  }

  if (searchParams.brand) {
    where.brand = { slug: searchParams.brand };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.sellingPrice = {};
    if (searchParams.minPrice) where.sellingPrice.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.sellingPrice.lte = parseFloat(searchParams.maxPrice);
  }

  let orderBy: any = { createdAt: "desc" };
  if (searchParams.sort === "price-asc") orderBy = { sellingPrice: "asc" };
  if (searchParams.sort === "price-desc") orderBy = { sellingPrice: "desc" };
  if (searchParams.sort === "discount") orderBy = { discountPercent: "desc" };

  let products = await db.product.findMany({
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

  // Fallback to category products if no specific subcategory product is seeded yet
  let isFallbackNotice = false;
  if (products.length === 0 && activeSubSlug) {
    products = await db.product.findMany({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    if (products.length > 0) {
      isFallbackNotice = true;
    }
  }

  const brands = await db.brand.findMany({
    where: { isActive: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-blue">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/category/${targetCategorySlug}`} className="font-semibold text-slate-900 hover:text-brand-blue">
          {category.name}
        </Link>
        {activeSubSlug && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-brand-blue font-medium">
              {category.subcategories.find((s) => s.slug === activeSubSlug)?.name || activeSubSlug}
            </span>
          </>
        )}
      </nav>

      {/* Category Banner & Title */}
      <div className="bg-dark-gradient rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            AUREVO Catalog
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">
            {activeSubSlug
              ? category.subcategories.find((s) => s.slug === activeSubSlug)?.name || category.name
              : category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category.description ||
              `Explore the highest rated ${category.name.toLowerCase()} from top brands with certified manufacturer warranties, transparent pricing, and free doorstep delivery.`}
          </p>
        </div>
      </div>

      {/* Subcategories Horizontal Bar */}
      {category.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href={`/category/${targetCategorySlug}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
              !activeSubSlug
                ? "bg-brand-blue text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:border-brand-blue"
            }`}
          >
            All {category.name}
          </Link>
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/category/${targetCategorySlug}?sub=${sub.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                activeSubSlug === sub.slug
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-brand-blue"
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="bg-white p-5 rounded-2xl border border-slate-200 space-y-6 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-brand-blue" />
              Filters
            </h3>
            <Link
              href={`/category/${targetCategorySlug}`}
              className="text-xs text-brand-blue hover:underline font-semibold"
            >
              Clear All
            </Link>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Price Range
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <Link
                href={`/category/${targetCategorySlug}?maxPrice=15000`}
                className="block py-1 hover:text-brand-blue"
              >
                Under ₹15,000
              </Link>
              <Link
                href={`/category/${targetCategorySlug}?minPrice=15000&maxPrice=30000`}
                className="block py-1 hover:text-brand-blue"
              >
                ₹15,000 - ₹30,000
              </Link>
              <Link
                href={`/category/${targetCategorySlug}?minPrice=30000&maxPrice=50000`}
                className="block py-1 hover:text-brand-blue"
              >
                ₹30,000 - ₹50,000
              </Link>
              <Link
                href={`/category/${targetCategorySlug}?minPrice=50000`}
                className="block py-1 hover:text-brand-blue"
              >
                ₹50,000 & Above
              </Link>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Brands
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/category/${targetCategorySlug}?brand=${b.slug}`}
                  className={`block py-1 hover:text-brand-blue ${
                    searchParams.brand === b.slug ? "font-bold text-brand-blue" : ""
                  }`}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Warranty & Installation Badges */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
            <p className="font-bold text-slate-800">AUREVO Promise</p>
            <p className="text-[11px] text-slate-500">
              ✓ 100% Brand Certified Stock<br />
              ✓ Direct GST Tax Invoices<br />
              ✓ Free Professional Setup on Tagged Items
            </p>
          </div>
        </aside>

        {/* Right Products Section */}
        <div className="lg:col-span-3 space-y-6">
          {isFallbackNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">Showing curated items from {category.name}</p>
                <p className="text-amber-700 mt-0.5">
                  Exclusive premium stock for this specific collection is arriving shortly. Here are top-rated selections in this department.
                </p>
              </div>
              <Link
                href={`/category/${targetCategorySlug}`}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shrink-0"
              >
                View All
              </Link>
            </div>
          )}

          {/* Header Controls (Count + Sort) */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{products.length}</strong> products
            </span>

            {/* Sort Options */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Sort By:</span>
              <Link
                href={`/category/${targetCategorySlug}?sort=price-asc`}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-brand-blue"
              >
                Price: Low to High
              </Link>
              <Link
                href={`/category/${targetCategorySlug}?sort=price-desc`}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-brand-blue"
              >
                Price: High to Low
              </Link>
              <Link
                href={`/category/${targetCategorySlug}?sort=discount`}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-brand-blue"
              >
                Discount
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <p className="text-sm font-semibold text-slate-700">No products match your current filters.</p>
              <Link
                href={`/category/${targetCategorySlug}`}
                className="inline-block px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold"
              >
                View All {category.name}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* SEO Content & Category FAQ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-600">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-blue" />
              Frequently Asked Questions about {category.name}
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <h4 className="font-semibold text-slate-800">
                  Are all {category.name.toLowerCase()} covered by genuine manufacturer warranty?
                </h4>
                <p className="text-slate-500 mt-0.5">
                  Yes, every unit purchased on AUREVO.digital is sourced directly from brand authorized distributors and carries standard company warranty valid across all authorized service centers in India.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">
                  How does installation work for large appliances?
                </h4>
                <p className="text-slate-500 mt-0.5">
                  Once your order is delivered, the official brand service partner is automatically notified for scheduling doorstep unboxing and installation within 24 to 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
