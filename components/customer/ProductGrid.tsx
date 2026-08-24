'use client';

import React from 'react';
import { Package, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ProductGridProps {
  products: any[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyTitle = 'No Formulations Found',
  emptyDescription = 'Try adjusting your filters or search keywords to discover luxury alternatives.',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-3xl bg-luxury-card/50 p-4 border border-luxury-border">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/3 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 rounded-3xl bg-luxury-card/40 border border-luxury-border p-8">
        <div className="w-16 h-16 rounded-3xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center mx-auto text-luxury-gold shadow-lg shadow-luxury-gold/10">
          <Package className="w-8 h-8 opacity-80" />
        </div>
        <h3 className="text-xl font-bold font-brand text-white">{emptyTitle}</h3>
        <p className="text-xs text-luxury-muted max-w-md mx-auto leading-relaxed">
          {emptyDescription}
        </p>
        <div className="pt-2">
          <Link href="/shop">
            <Button variant="gold" size="sm">
              Explore All Formulations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
