'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { ProductGrid } from '@/components/customer/ProductGrid';
import { FilterSidebar } from '@/components/customer/FilterSidebar';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.data.categories);
      if (brandRes.success) setBrands(brandRes.data.brands);
    });
  }, []);

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      if (query) sp.set('q', query);
      if (selectedCategory) sp.set('category', selectedCategory);
      if (selectedBrand) sp.set('brand', selectedBrand);
      if (minPrice) sp.set('minPrice', minPrice);
      if (maxPrice && maxPrice !== '999999') sp.set('maxPrice', maxPrice);
      if (inStockOnly) sp.set('inStock', 'true');
      sp.set('sort', sortBy);

      const res = await fetch(`/api/search?${sp.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query, selectedCategory, selectedBrand, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleClearAll = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Search Query Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-luxury-border/60 bg-luxury-card/30">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-luxury-gold uppercase tracking-widest font-mono">
            <Search className="w-3.5 h-3.5" />
            <span>Search Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-brand text-white">
            {query ? (
              <>
                Search Results for: <span className="gold-text-gradient font-italic">"{query}"</span>
              </>
            ) : (
              'Explore Haute Catalogue'
            )}
          </h1>
          <p className="text-xs text-luxury-muted">
            Found {products.length} luxury creations matching your discovery criteria.
          </p>
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
              Showing <strong className="text-white">{products.length}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-luxury-muted">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="bestseller">Best Sellers</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onCategoryChange={setSelectedCategory}
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
                      Refine Search Results
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
                  selectedCategory={selectedCategory}
                  selectedBrand={selectedBrand}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  inStockOnly={inStockOnly}
                  onCategoryChange={setSelectedCategory}
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
              emptyTitle={`No creations matched "${query}"`}
              emptyDescription="Our master perfumers and dermatologists suggest browsing our signature formulations or checking your spelling."
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-luxury-darkest flex items-center justify-center text-luxury-gold">
          Searching Formulations...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
