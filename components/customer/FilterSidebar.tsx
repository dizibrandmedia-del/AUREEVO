'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterSidebarProps {
  categories: any[];
  brands: any[];
  attributes?: any[];
  selectedCategory: string;
  selectedBrand: string;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  selectedAttributeCode?: string;
  selectedAttributeVal?: string;
  onCategoryChange: (catSlug: string) => void;
  onBrandChange: (brandSlug: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onStockToggle: (inStock: boolean) => void;
  onAttributeChange?: (code: string, val: string) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  categories,
  brands,
  attributes = [],
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  inStockOnly,
  selectedAttributeCode,
  selectedAttributeVal,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onStockToggle,
  onAttributeChange,
  onClearAll,
}: FilterSidebarProps) {
  const hasActiveFilters =
    !!selectedCategory ||
    !!selectedBrand ||
    !!minPrice ||
    (!!maxPrice && maxPrice !== '999999') ||
    inStockOnly ||
    !!selectedAttributeVal;

  return (
    <div className="space-y-6 bg-luxury-card/60 border border-luxury-border p-6 rounded-3xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-luxury-border/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-luxury-gold" />
          <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
            Haute Filters
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-luxury-gold-light hover:text-white flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Availability Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onStockToggle(e.target.checked)}
            className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
          />
          <span className="font-semibold">In Stock For Immediate Dispatch Only</span>
        </label>
      </div>

      {/* Category Hierarchy */}
      <div className="space-y-2.5 pt-3 border-t border-luxury-border/60">
        <span className="text-xs font-bold uppercase tracking-wider text-luxury-muted block">
          Category
        </span>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-luxury-gold text-luxury-darkest font-bold'
                : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/40'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-luxury-gold text-luxury-darkest font-bold'
                  : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2.5 pt-3 border-t border-luxury-border/60">
        <span className="text-xs font-bold uppercase tracking-wider text-luxury-muted block">
          Maison & Brand
        </span>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onBrandChange('')}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              !selectedBrand
                ? 'bg-luxury-gold text-luxury-darkest font-bold'
                : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/40'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => onBrandChange(b.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedBrand === b.slug
                  ? 'bg-luxury-gold text-luxury-darkest font-bold'
                  : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/40'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Presets & Inputs */}
      <div className="space-y-3 pt-3 border-t border-luxury-border/60">
        <span className="text-xs font-bold uppercase tracking-wider text-luxury-muted block">
          Price Range (₹)
        </span>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min (₹)"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full px-3 py-1.5 bg-luxury-dark/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
          <input
            type="number"
            placeholder="Max (₹)"
            value={maxPrice === '999999' ? '' : maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full px-3 py-1.5 bg-luxury-dark/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Under ₹5K', min: '0', max: '5000' },
            { label: '₹5K - ₹15K', min: '5000', max: '15000' },
            { label: '₹15K - ₹30K', min: '15000', max: '30000' },
            { label: 'Above ₹30K', min: '30000', max: '999999' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onPriceChange(preset.min, preset.max)}
              className="px-2.5 py-1 rounded-lg bg-luxury-surface/40 hover:bg-luxury-surface/80 border border-luxury-border text-[10px] font-mono text-luxury-gold-light"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
