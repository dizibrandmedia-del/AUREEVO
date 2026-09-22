"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  Wrench,
  Truck,
  MessageCircle,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCartStore, useWishlistStore, useCompareStore } from "@/lib/store";
import LeadModal from "./LeadModal";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const isInCompare = useCompareStore((s) => s.isInCompare(product.id));

  const primaryImage =
    product.images?.[0]?.url ||
    (typeof product.images?.[0] === "string" ? product.images[0] : "") ||
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800";

  const savings = Math.max(0, product.mrp - product.sellingPrice);
  const discountPercent =
    product.discountPercent ||
    (product.mrp > 0 ? Math.round((savings / product.mrp) * 100) : 0);

  // EMI Estimate starting formula: 6-month no-cost EMI
  const emiAmount = Math.round(product.sellingPrice / 6);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    router.push("/checkout");
  };

  const handleWhatsAppEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    const msg = `Hi, I am interested in ${product.name} (SKU: ${product.sku}). Please share your best price and delivery schedule.`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-brand-border/80 hover:border-brand-gold/60 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover">
        {/* Badges & Actions Bar */}
        <div className="relative">
          {/* Top Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            {discountPercent > 0 && (
              <span className="bg-brand-emerald text-brand-gold-light border border-brand-gold/30 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-gradient-to-r from-brand-gold-light to-brand-gold text-brand-dark text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                Royal Choice
              </span>
            )}
            {product.installationType === "FREE" && (
              <span className="bg-brand-dark text-brand-gold-light text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-brand-gold/20 shadow-sm">
                <Wrench className="w-2.5 h-2.5 text-brand-gold" /> Free Install
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition ${
              isInWishlist
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm"
                : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm"
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>

          {/* Product Image */}
          <Link
            href={`/product/${product.slug}`}
            className="block aspect-square w-full rounded-2xl overflow-hidden bg-brand-bg/50 relative group-hover:opacity-95 transition"
          >
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        </div>

        {/* Content Section */}
        <div className="mt-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Comparison Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-luxury font-bold uppercase tracking-widest text-brand-gold-dark text-[11px]">
                {product.brand?.name || "AUREVO Luxury"}
              </span>

              {/* Compare toggle */}
              <button
                type="button"
                onClick={() => toggleCompare(product)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition ${
                  isInCompare
                    ? "bg-brand-gold/15 text-brand-gold-dark font-bold border border-brand-gold/30"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Compare up to 4 products"
              >
                <Layers className="w-3 h-3" />
                {isInCompare ? "Added" : "Compare"}
              </button>
            </div>

            {/* Title */}
            <Link
              href={`/product/${product.slug}`}
              className="font-bold text-xs sm:text-sm text-brand-text group-hover:text-brand-emerald transition line-clamp-2 leading-snug"
            >
              {product.name}
            </Link>

            {/* Ratings & Warranty Meta */}
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold text-[11px]">
                <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                <span>4.8</span>
              </div>
              <span className="text-[11px] text-slate-500">
                ({product.warrantyMonths ? `${product.warrantyMonths / 12}Y Brand Warranty` : "Official Warranty"})
              </span>
            </div>
          </div>

          {/* Pricing & Savings */}
          <div className="mt-3 pt-2.5 border-t border-brand-border/60">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-brand-text">
                ₹{product.sellingPrice.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* EMI & Savings Note */}
            <div className="flex items-center justify-between text-[11px] mt-0.5">
              <span className="text-slate-500">
                EMI from <strong className="text-slate-800">₹{emiAmount.toLocaleString()}/mo</strong>
              </span>
              {savings > 0 && (
                <span className="text-emerald-700 font-bold">
                  Save ₹{savings.toLocaleString()}
                </span>
              )}
            </div>

            {/* Delivery & Badges */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1.5">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Truck className="w-3 h-3 text-brand-gold-dark" />
                White Glove Delivery
              </span>
              <span>•</span>
              <span className="text-emerald-800 font-semibold">Available in Stock</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold border border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-brand-gold-light transition active:scale-95 shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-black bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark shadow-sm hover:shadow-gold-glow transition active:scale-95 uppercase font-luxury tracking-wide"
              >
                <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="truncate">Buy Now</span>
              </button>
            </div>

            {/* Omnichannel Best Price & WhatsApp Quote */}
            <div className="flex items-center justify-between gap-1 mt-2.5 pt-1.5 border-t border-brand-border/40 text-[10px] sm:text-[11px]">
              <button
                type="button"
                onClick={() => setIsLeadModalOpen(true)}
                className="font-bold text-brand-gold-dark hover:text-brand-dark transition truncate"
              >
                ⚡ Get Best Price
              </button>

              <button
                type="button"
                onClick={handleWhatsAppEnquiry}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold shrink-0"
                title="WhatsApp Enquiry"
              >
                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Generation Modal */}
      {isLeadModalOpen && (
        <LeadModal
          productName={product.name}
          onClose={() => setIsLeadModalOpen(false)}
        />
      )}
    </>
  );
}
