'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { useWishlist } from '@/components/customer/WishlistContext';
import { useCart } from '@/components/customer/CartContext';
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const handleMoveToCart = async (item: any) => {
    const success = await addToCart(item.productId, item.variantId, 1);
    if (success) {
      await removeFromWishlist(item.id);
      setIsCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Header Banner */}
      <section className="bg-luxury-card/30 border-b border-luxury-border/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-luxury-gold uppercase tracking-widest font-mono">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Private Sanctuary</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-brand text-white">
            My Wishlist ({items.length})
          </h1>
          <p className="text-xs text-luxury-muted max-w-xl">
            Reserved creations and aspirational formulations saved for future acquisition.
          </p>
        </div>
      </section>

      {/* Wishlist Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        {items.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-luxury-card/40 border border-luxury-border p-8">
            <div className="w-16 h-16 rounded-3xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center mx-auto text-luxury-gold shadow-lg shadow-luxury-gold/10">
              <Heart className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-xl font-bold font-brand text-white">Your Wishlist is Empty</h3>
            <p className="text-xs text-luxury-muted max-w-md mx-auto leading-relaxed">
              Explore our haute skincare, perfumes, and signature collections to save your desired items.
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button variant="gold" size="sm">
                  Explore Catalogue
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const images = item.product.images ? JSON.parse(item.product.images) : [];
              const image = images[0] || '/images/aureevo-logo.png';
              const price = item.variant ? item.variant.price : item.product.sellingPrice;
              const mrp = item.variant ? item.variant.mrp : item.product.mrp;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-luxury-card/85 border border-luxury-border p-5 space-y-4 flex flex-col justify-between group hover:border-luxury-gold/50 transition-all"
                >
                  <div className="space-y-3">
                    <div className="aspect-[4/3] rounded-2xl bg-luxury-surface/50 overflow-hidden relative p-2 flex items-center justify-center">
                      <img src={image} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-luxury-darkest/80 text-luxury-muted hover:text-rose-400 border border-luxury-border backdrop-blur-sm transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] text-luxury-gold-light uppercase font-mono block">
                        {item.product.brand?.name || 'AUREEVO Maison'}
                      </span>
                      <Link href={`/product/${item.product.slug}`} className="hover:text-luxury-gold-light transition-colors">
                        <h4 className="text-sm font-bold font-brand text-white line-clamp-2 mt-0.5">
                          {item.product.name}
                        </h4>
                      </Link>
                      {item.variant && (
                        <span className="text-[11px] text-luxury-muted font-mono block mt-1">
                          Edition: {item.variant.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-luxury-border/60 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold font-brand text-white">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {mrp > price && (
                        <span className="text-xs text-luxury-muted line-through">
                          ₹{mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      className="w-full"
                      onClick={() => handleMoveToCart(item)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      Move to Shopping Bag
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
