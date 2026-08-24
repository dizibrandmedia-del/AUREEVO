'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { useCart } from '@/components/customer/CartContext';
import {
  ShoppingBag,
  Trash2,
  Bookmark,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/ToastContext';

export default function CartPage() {
  const { success } = useToast();
  const {
    items,
    savedItems,
    summary,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'ROYAL10' || couponCode.toUpperCase() === 'AUREEVO') {
      setAppliedCoupon(couponCode.toUpperCase());
      success('Privilege Voucher Applied', '10% Clientèle discount enabled');
    } else {
      success('Voucher Registered', 'Voucher verified for upcoming harvest checkout');
      setAppliedCoupon(couponCode.toUpperCase());
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotal / summary.freeShippingThreshold) * 100)
  );

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Header Banner */}
      <section className="bg-luxury-card/30 border-b border-luxury-border/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-luxury-gold uppercase tracking-widest font-mono">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shopping Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-brand text-white">
            Your Shopping Bag ({summary.itemCount} Items)
          </h1>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {items.length === 0 && savedItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-luxury-card/40 border border-luxury-border p-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center mx-auto text-luxury-gold shadow-lg shadow-luxury-gold/10">
              <ShoppingBag className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-xl font-bold font-brand text-white">Your Shopping Bag is Empty</h3>
            <p className="text-xs text-luxury-muted max-w-md mx-auto leading-relaxed">
              Indulge in our cellular cosmetic alchemy and haute French extrait de parfum.
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button variant="gold" size="sm">
                  Explore Haute Formulations
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* LEFT 2 COLS: ACTIVE ITEMS & SAVED FOR LATER */}
            <div className="lg:col-span-2 space-y-8">
              {/* Free Shipping Progress Indicator */}
              <div className="p-4 rounded-2xl bg-luxury-emerald/40 border border-luxury-gold/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-luxury-gold-light font-medium">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                    {summary.amountNeededForFreeShipping > 0
                      ? `Add ₹${summary.amountNeededForFreeShipping.toLocaleString('en-IN')} more to unlock Complimentary White-Glove Shipping`
                      : 'Complimentary White-Glove Shipping Unlocked on this Order!'}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-luxury-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Active Items List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
                  Active Bag Items ({items.length})
                </h3>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-5 rounded-3xl bg-luxury-card/90 border border-luxury-border hover:border-luxury-gold/40 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 rounded-2xl bg-luxury-surface/50 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center p-2">
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover rounded-xl" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.productSlug}`}
                            className="text-sm font-bold font-brand text-white hover:text-luxury-gold-light"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variantName && (
                          <span className="text-xs text-luxury-gold font-mono block mt-0.5">
                            Edition: {item.variantName}
                          </span>
                        )}
                        <span className="text-[10px] text-luxury-muted font-mono block">
                          SKU: {item.sku}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-luxury-border/40">
                        {/* Qty */}
                        <div className="flex items-center gap-3 p-1.5 rounded-xl bg-luxury-dark/90 border border-luxury-border text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-luxury-muted hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-white min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1 text-luxury-muted hover:text-white disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-base font-bold font-brand text-white block">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-luxury-muted line-through">
                              ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => saveForLater(item.id)}
                          className="text-xs text-luxury-gold-light hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Save for Later</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save for Later Section */}
              {savedItems.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-luxury-border/60">
                  <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-luxury-gold-light">
                    Saved for Later ({savedItems.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedItems.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 rounded-2xl bg-luxury-card/60 border border-luxury-border space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-luxury-surface/50 overflow-hidden shrink-0">
                            <img src={s.image} alt={s.productName} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{s.productName}</h4>
                            <span className="text-xs font-bold font-brand text-luxury-gold mt-1 block">
                              ₹{s.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="gold"
                            size="sm"
                            className="flex-1"
                            onClick={() => moveToCart(s.id)}
                          >
                            Move to Bag
                          </Button>
                          <button
                            onClick={() => removeFromCart(s.id)}
                            className="p-2 rounded-xl text-luxury-muted hover:text-rose-400 bg-luxury-surface/50 border border-luxury-border"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COL: SUMMARY & CHECKOUT CARD */}
            <div className="lg:col-span-1 space-y-6 sticky top-28">
              {/* Privilege Code Voucher Box */}
              <div className="p-5 rounded-3xl bg-luxury-card/90 border border-luxury-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Tag className="w-4 h-4 text-luxury-gold" />
                  <span>Privilege Voucher Code</span>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ROYAL10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-luxury-dark/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold uppercase font-mono"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Apply
                  </Button>
                </form>

                {appliedCoupon && (
                  <div className="p-2 rounded-xl bg-luxury-emerald/40 border border-luxury-gold/40 text-xs text-luxury-gold-light flex items-center justify-between">
                    <span className="font-mono font-bold">VOUCHER: {appliedCoupon}</span>
                    <Badge variant="gold" size="sm">Verified</Badge>
                  </div>
                )}
              </div>

              {/* Commercial Summary */}
              <div className="p-6 rounded-3xl bg-luxury-card border border-luxury-border space-y-4 shadow-xl">
                <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
                  Haute Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-luxury-muted">
                    <span>Bag Subtotal</span>
                    <span className="text-white font-semibold">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {summary.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Maison Privileges</span>
                      <span>-₹{summary.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-luxury-muted">
                    <span>Applicable GST (18.0%)</span>
                    <span className="text-white">₹{summary.tax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-luxury-muted">
                    <span>White-Glove Shipping</span>
                    <span className={summary.shipping === 0 ? 'text-emerald-400 font-semibold' : 'text-white'}>
                      {summary.shipping === 0 ? 'COMPLIMENTARY' : `₹${summary.shipping}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-luxury-border/60 flex items-center justify-between text-sm font-bold font-brand text-white">
                    <span>Total Amount</span>
                    <span className="text-lg text-luxury-gold">₹{summary.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout Handoff CTA */}
                <Link href="/checkout" className="block">
                  <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    className="w-full justify-center text-xs sm:text-sm py-3"
                    disabled={items.length === 0}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Encrypted Checkout
                  </Button>
                </Link>

                <div className="pt-2 text-center text-[10px] text-luxury-muted space-y-1">
                  <div className="flex items-center justify-center gap-1 text-luxury-gold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit Bank Grade Encryption</span>
                  </div>
                  <p>All items stored in temperature-controlled luxury fulfillment vaults.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
