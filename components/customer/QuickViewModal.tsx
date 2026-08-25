'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

import { parseProductImages } from '@/lib/utils';

interface QuickViewModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<any>(
    product?.variants?.[0] || null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const images = parseProductImages(product?.images);
  const primaryImage = images[selectedImageIndex] || '/images/aureevo-logo.png';
  const inWishlist = isInWishlist(product.id, selectedVariant?.id);

  const currentPrice = selectedVariant ? selectedVariant.price : product.sellingPrice;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.inventories?.[0]?.currentStock || 0;

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariant?.id || null, 1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.brand?.name || 'AUREEVO Maison'}
      subtitle={product.name}
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
        {/* Media Preview Column */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-luxury-surface/50 border border-luxury-border overflow-hidden relative flex items-center justify-center p-2">
            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover rounded-xl" />
            {product.isFeatured && (
              <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-luxury-gold text-luxury-darkest text-[9px] font-bold uppercase tracking-wider shadow">
                Signature
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl border overflow-hidden shrink-0 transition-all p-0.5 ${
                    selectedImageIndex === idx
                      ? 'border-luxury-gold ring-2 ring-luxury-gold/20'
                      : 'border-luxury-border opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Selection Column */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold-light">
                {product.brand?.name || 'AUREEVO Maison'}
              </span>
              <div className="flex items-center gap-1 text-xs text-luxury-gold">
                <Star className="w-3.5 h-3.5 fill-luxury-gold text-luxury-gold" />
                <span className="font-bold">{product.rating || 5.0}</span>
                <span className="text-luxury-muted text-[10px]">({product.reviewCount || 1})</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-brand text-white leading-snug">
              {product.name}
            </h2>

            {product.shortDescription && (
              <p className="text-xs text-luxury-muted leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Pricing Matrix */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl font-bold font-brand text-white">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {currentMrp > currentPrice && (
                <>
                  <span className="text-xs text-luxury-muted line-through">
                    ₹{currentMrp.toLocaleString('en-IN')}
                  </span>
                  <Badge variant="gold" size="sm">
                    {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-luxury-muted block">
                  Select Edition / Size:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'bg-luxury-gold text-luxury-darkest border-luxury-gold shadow-md shadow-luxury-gold/20'
                          : 'bg-luxury-surface/50 border-luxury-border text-white hover:border-luxury-gold/60'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock State */}
            <div className="pt-2">
              {currentStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  In Stock for Immediate White-Glove Dispatch
                </span>
              ) : (
                <span className="text-xs text-rose-400 font-medium">
                  Currently Out of Stock (Limited Harvest)
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-luxury-border/60">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="gold"
                size="md"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || isCartLoading}
                isLoading={isCartLoading}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                Add to Shopping Bag
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id, selectedVariant?.id)}
                className={`p-3 rounded-2xl border transition-colors ${
                  inWishlist
                    ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold'
                    : 'bg-luxury-surface/50 border-luxury-border text-luxury-muted hover:text-white'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
              </button>
            </div>

            <div className="text-center">
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs text-luxury-gold-light hover:underline font-semibold"
              >
                <span>View Full Formulation Dossier & Ritual</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
