'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { ProductGrid } from '@/components/customer/ProductGrid';
import { FilterSidebar } from '@/components/customer/FilterSidebar';
import { SlidersHorizontal, ChevronRight, Sparkles } from 'lucide-react';

export default function CategoryPage({ params }: { params: { slug: string[] } }) {
  const currentSlug = params.slug[params.slug.length - 1];

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Fetch all lookup categories & brands
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) {
        setCategories(catRes.data.categories);
        // Find current category details from tree
        const findCat = (list: any[]): any => {
          for (const item of list) {
            if (item.slug === currentSlug) return item;
            if (item.children?.length > 0) {
              const found = findCat(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        const activeCat = findCat(catRes.data.categories);
        if (activeCat) setCategory(activeCat);
      }
      if (brandRes.success) setBrands(brandRes.data.brands);
    });
  }, [currentSlug]);

  const fetchCategoryProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('category', currentSlug);
      if (selectedBrand) query.set('brand', selectedBrand);
      if (minPrice) query.set('minPrice', minPrice);
      if (maxPrice && maxPrice !== '999999') query.set('maxPrice', maxPrice);
      if (inStockOnly) query.set('inStock', 'true');
      query.set('sort', sortBy);

      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch {
      // Ignore error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [currentSlug, selectedBrand, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleClearAll = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Category Banner & Breadcrumb */}
      <section className="relative py-14 px-4 sm:px-6 lg:px-8 border-b border-luxury-border/60 bg-luxury-card/30 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-luxury-muted">
            <Link href="/" className="hover:text-luxury-gold">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-luxury-gold">
              Maison Collections
            </Link>
            {params.slug.map((s, idx) => (
              <React.Fragment key={s}>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-luxury-gold-light capitalize">
                  {s.replace(/-/g, ' ')}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-brand text-white capitalize">
            {category?.name || currentSlug.replace(/-/g, ' ')}
          </h1>

          {category?.description && (
            <p className="text-xs sm:text-sm text-luxury-muted max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Subcategories Pills */}
          {category?.children?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {category.children.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.slug}/${sub.slug}`}
                  className="px-3 py-1.5 rounded-xl bg-luxury-surface/50 hover:bg-luxury-gold hover:text-luxury-darkest border border-luxury-border text-xs font-semibold text-white transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-luxury-border/60 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 text-xs font-semibold text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-luxury-gold" />
              <span>Filters</span>
            </button>
            <span className="text-xs text-luxury-muted">
              Showing <strong className="text-white">{products.length}</strong> creations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-luxury-muted">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold cursor-pointer"
            >
              <option value="newest">Newest Launches</option>
              <option value="bestseller">Best Sellers</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={currentSlug}
              selectedBrand={selectedBrand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onCategoryChange={(catSlug) => {
                if (catSlug) window.location.href = `/category/${catSlug}`;
                else window.location.href = '/shop';
              }}
              onBrandChange={setSelectedBrand}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              onStockToggle={setInStockOnly}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Mobile Filter Drawer Modal */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <div className="relative z-10 bg-luxury-darkest border-t border-luxury-gold/40 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-luxury-border/60">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-luxury-gold" />
                    <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
                      Refine Collection
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-luxury-surface/50 text-xs font-semibold text-white"
                  >
                    Close
                  </button>
                </div>

                <FilterSidebar
                  categories={categories}
                  brands={brands}
                  selectedCategory={currentSlug}
                  selectedBrand={selectedBrand}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  inStockOnly={inStockOnly}
                  onCategoryChange={(catSlug) => {
                    if (catSlug) window.location.href = `/category/${catSlug}`;
                    else window.location.href = '/shop';
                  }}
                  onBrandChange={setSelectedBrand}
                  onPriceChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                  onStockToggle={setInStockOnly}
                  onClearAll={handleClearAll}
                />

                <div className="pt-2">
                  <button
                    className="w-full py-3 rounded-xl bg-luxury-gold text-luxury-darkest font-bold text-xs shadow-lg uppercase tracking-wider"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    Apply Filters ({products.length} Results)
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="lg:col-span-3">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              emptyTitle={`No products currently in ${category?.name || currentSlug}`}
              emptyDescription="Our master formulators are crafting the next batch harvest. Check back soon or explore other categories."
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
