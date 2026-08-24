'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { ProductGrid } from '@/components/customer/ProductGrid';
import { FilterSidebar } from '@/components/customer/FilterSidebar';
import { ChevronRight, Globe, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BrandPage({ params }: { params: { slug: string } }) {
  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.data.categories);
      if (brandRes.success) {
        setBrands(brandRes.data.brands);
        const b = brandRes.data.brands.find((item: any) => item.slug === params.slug);
        if (b) setBrand(b);
      }
    });
  }, [params.slug]);

  const fetchBrandProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('brand', params.slug);
      if (selectedCategory) query.set('category', selectedCategory);
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
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandProducts();
  }, [params.slug, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleClearAll = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Brand Profile Banner */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-luxury-border/60 bg-luxury-card/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-luxury-muted">
            <Link href="/" className="hover:text-luxury-gold">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-luxury-gold">
              Maisons
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-luxury-gold-light">{brand?.name || params.slug}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/40 p-2 flex items-center justify-center shadow-xl shadow-luxury-gold/10 shrink-0">
                <img
                  src={brand?.logo || '/images/aureevo-logo.png'}
                  alt={brand?.name || 'Brand'}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-bold font-brand text-white">
                    {brand?.name || params.slug.replace(/-/g, ' ')}
                  </h1>
                  {brand?.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full bg-luxury-gold text-luxury-darkest text-[9px] font-bold uppercase tracking-wider">
                      Maison Partner
                    </span>
                  )}
                </div>
                {brand?.description && (
                  <p className="text-xs text-luxury-muted max-w-xl mt-1 leading-relaxed">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>

            {brand?.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-luxury-surface/50 border border-luxury-border hover:border-luxury-gold text-xs text-white transition-colors"
              >
                <Globe className="w-4 h-4 text-luxury-gold" />
                <span>Visit Official Maison</span>
              </a>
            )}
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={params.slug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onCategoryChange={setSelectedCategory}
              onBrandChange={(b) => {
                if (b) window.location.href = `/brand/${b}`;
                else window.location.href = '/shop';
              }}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              onStockToggle={setInStockOnly}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Mobile Filter */}
          {isMobileFilterOpen && (
            <div className="lg:hidden col-span-1 mb-6">
              <FilterSidebar
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                selectedBrand={params.slug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStockOnly={inStockOnly}
                onCategoryChange={setSelectedCategory}
                onBrandChange={(b) => {
                  if (b) window.location.href = `/brand/${b}`;
                  else window.location.href = '/shop';
                }}
                onPriceChange={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
                onStockToggle={setInStockOnly}
                onClearAll={handleClearAll}
              />
            </div>
          )}

          <div className="lg:col-span-3">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              emptyTitle="No creations currently catalogued for this brand"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
