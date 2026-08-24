'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { ProductGrid } from '@/components/customer/ProductGrid';
import { FilterSidebar } from '@/components/customer/FilterSidebar';
import { SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategory) query.set('category', selectedCategory);
      if (selectedBrand) query.set('brand', selectedBrand);
      if (minPrice) query.set('minPrice', minPrice);
      if (maxPrice && maxPrice !== '999999') query.set('maxPrice', maxPrice);
      if (inStockOnly) query.set('inStock', 'true');
      if (isFeatured) query.set('isFeatured', 'true');
      query.set('sort', sortBy);
      query.set('limit', '18');

      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.data.categories);
      if (brandRes.success) setBrands(brandRes.data.brands);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, inStockOnly, sortBy, isFeatured]);

  const handleClearAll = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setIsFeatured(false);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Page Title & Breadcrumbs Banner */}
      <section className="bg-luxury-card/30 border-b border-luxury-border/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
            Haute Formulations & Essences
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-brand text-white">
            {isFeatured ? 'Signature Editions' : 'Complete Catalogue'}
          </h1>
          <p className="text-xs text-luxury-muted max-w-xl">
            Explore handcrafted cellular skincare, royal saffron concentrates, and vintage extrait de parfum.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
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
              Showing <strong className="text-white">{pagination.total}</strong> luxury formulations
            </span>
          </div>

          {/* Sort Selector */}
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
          {/* Desktop Filter Sidebar */}
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
                      Refine Formulations
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
                  onCategoryChange={(cat) => {
                    setSelectedCategory(cat);
                  }}
                  onBrandChange={(b) => {
                    setSelectedBrand(b);
                  }}
                  onPriceChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                  onStockToggle={setInStockOnly}
                  onClearAll={handleClearAll}
                />

                <div className="pt-2">
                  <Button
                    variant="gold"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    Apply Filters ({pagination.total} Results)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            <ProductGrid products={products} isLoading={isLoading} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-luxury-darkest flex items-center justify-center text-luxury-gold">
          Loading Luxury Catalogue...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
