'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Bookmark,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from './CartContext';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const {
    items,
    summary,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    saveForLater,
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotal / summary.freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-luxury-darkest border-l border-luxury-border shadow-2xl flex flex-col z-10 animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-luxury-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-base font-bold font-brand tracking-wide text-white">
              Shopping Bag ({summary.itemCount})
            </h2>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-luxury-muted hover:text-white bg-luxury-surface/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Dynamic Progress Bar */}
        <div className="p-4 bg-luxury-emerald/40 border-b border-luxury-border/60 text-xs">
          <div className="flex items-center justify-between text-luxury-gold-light font-medium mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
              {summary.amountNeededForFreeShipping > 0
                ? `Add ₹${summary.amountNeededForFreeShipping.toLocaleString('en-IN')} for Free Delivery`
                : 'Complimentary White-Glove Shipping Unlocked!'}
            </span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-luxury-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-luxury-emerald/40 border border-luxury-border flex items-center justify-center mx-auto text-luxury-gold">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="text-base font-bold font-brand text-white">Your Bag is Empty</h3>
              <p className="text-xs text-luxury-muted max-w-xs mx-auto">
                Explore our haute formulations and iconic fragrances to fill your shopping bag.
              </p>
              <Link href="/shop" onClick={() => setIsCartOpen(false)}>
                <Button variant="gold" size="sm">
                  Explore Catalogue
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3.5 rounded-2xl bg-luxury-card/70 border border-luxury-border group hover:border-luxury-gold/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-luxury-surface/60 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs font-semibold text-white hover:text-luxury-gold-light truncate"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-luxury-muted hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.variantName && (
                      <span className="text-[10px] text-luxury-gold font-mono block mt-0.5">
                        {item.variantName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-luxury-dark/90 border border-luxury-border text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-luxury-muted hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-white min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="text-luxury-muted hover:text-white disabled:opacity-30 p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-xs font-bold font-brand text-white block">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-luxury-muted line-through">
                          ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1.5 flex justify-end">
                    <button
                      onClick={() => saveForLater(item.id)}
                      className="text-[10px] text-luxury-muted hover:text-luxury-gold flex items-center gap-1"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>Save for Later</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-luxury-border/60 bg-luxury-darkest/95 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-luxury-muted">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹{summary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Maison Privileges</span>
                  <span>-₹{summary.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-luxury-muted">
                <span>Estimated Tax (GST)</span>
                <span className="text-white">₹{summary.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-luxury-muted">
                <span>White-Glove Shipping</span>
                <span className={summary.shipping === 0 ? 'text-emerald-400 font-semibold' : 'text-white'}>
                  {summary.shipping === 0 ? 'COMPLIMENTARY' : `₹${summary.shipping}`}
                </span>
              </div>
              <div className="pt-2 border-t border-luxury-border/60 flex items-center justify-between text-sm font-bold font-brand text-white">
                <span>Total Amount</span>
                <span className="text-base text-luxury-gold">₹{summary.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/cart" onClick={() => setIsCartOpen(false)}>
                <Button variant="outline" size="md" className="w-full">
                  Detailed Bag
                </Button>
              </Link>
              <Link href="/cart" onClick={() => setIsCartOpen(false)}>
                <Button variant="gold" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Checkout
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-luxury-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold" />
              <span>100% Authentic Luxury Guarantee & Encrypted Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
