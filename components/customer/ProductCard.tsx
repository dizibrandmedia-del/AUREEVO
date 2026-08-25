'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuickViewModal } from './QuickViewModal';

import { parseProductImages } from '@/lib/utils';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = parseProductImages(product?.images);
  const primaryImage = images[0] || '/images/aureevo-logo.png';
  const secondaryImage = images[1] || primaryImage;

  const inWishlist = isInWishlist(product.id);
  const hasVariants = product.productType === 'VARIABLE' && product.variants?.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...product.variants.map((v: any) => v.price))
    : product.sellingPrice;
  const highestMrp = hasVariants
    ? Math.max(...product.variants.map((v: any) => v.mrp))
    : product.mrp;

  const totalStock = hasVariants
    ? product.variants.reduce((acc: number, v: any) => acc + v.stock, 0)
    : product.inventories?.[0]?.currentStock || 10;

  const isOutOfStock = totalStock <= 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      setIsQuickViewOpen(true);
    } else {
      await addToCart(product.id, null, 1);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  return (
    <>
      <div
        className="group relative rounded-3xl bg-luxury-card/85 border border-luxury-border hover:border-luxury-gold/50 shadow-lg hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all duration-500 flex flex-col overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Media Presentation */}
        <div className="relative aspect-[4/3] bg-luxury-surface/50 overflow-hidden p-2.5 sm:p-4 flex items-center justify-center">
          <Link href={`/product/${product.slug}`} className="w-full h-full block">
            <img
              src={isHovered && secondaryImage ? secondaryImage : primaryImage}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-all duration-700 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-col gap-1 pointer-events-none">
            {product.isFeatured && (
              <span className="px-2 py-0.5 rounded-full bg-luxury-gold text-luxury-darkest text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider shadow">
                Signature
              </span>
            )}
            {highestMrp > lowestPrice && (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-luxury-darkest/90 border border-luxury-gold/40 text-luxury-gold-light text-[8.5px] sm:text-[9px] font-bold">
                {Math.round(((highestMrp - lowestPrice) / highestMrp) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Floating Action Buttons (Always accessible on touch/mobile) */}
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex flex-col gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            {/* Wishlist Toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 ${
                inWishlist
                  ? 'bg-luxury-gold border-luxury-gold text-luxury-darkest'
                  : 'bg-luxury-darkest/80 border-luxury-border text-luxury-muted hover:text-white'
              }`}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Quick View */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-luxury-darkest/80 border border-luxury-border text-luxury-muted hover:text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 hidden sm:flex"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Out of Stock Overlay Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-800 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-luxury-muted uppercase tracking-widest font-mono">
              <span className="truncate max-w-[110px] sm:max-w-none">{product.brand?.name || 'AUREEVO Maison'}</span>
              <div className="flex items-center gap-1 text-luxury-gold shrink-0">
                <Star className="w-3 h-3 fill-luxury-gold text-luxury-gold" />
                <span className="font-bold">{product.rating || 5.0}</span>
                <span className="text-luxury-muted">({product.reviewCount || 1})</span>
              </div>
            </div>

            <Link href={`/product/${product.slug}`} className="block group-hover:text-luxury-gold-light transition-colors">
              <h3 className="text-xs sm:text-base font-bold font-brand text-white leading-snug line-clamp-2">
                {product.name}
              </h3>
            </Link>

            {product.shortDescription && (
              <p className="text-[11px] sm:text-xs text-luxury-muted line-clamp-2 leading-relaxed pt-0.5">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Pricing & Cart Action */}
          <div className="pt-2.5 sm:pt-3 border-t border-luxury-border/60 flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-bold font-brand text-white block truncate">
                {hasVariants ? 'From ' : ''}₹{lowestPrice.toLocaleString('en-IN')}
              </span>
              {highestMrp > lowestPrice && (
                <span className="text-[9px] sm:text-[10px] text-luxury-muted line-through block truncate">
                  ₹{highestMrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <Button
              type="button"
              variant={isOutOfStock ? 'ghost' : 'emerald'}
              size="sm"
              className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 shrink-0"
              onClick={handleQuickAdd}
              disabled={isOutOfStock || isCartLoading}
              leftIcon={<ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            >
              {isOutOfStock ? 'Sold Out' : hasVariants ? 'Select' : 'Add'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
