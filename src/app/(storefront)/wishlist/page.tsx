"use client";

import React from "react";
import Link from "next/link";
import { useWishlistStore, useCartStore } from "@/lib/store";
import { Heart, ShoppingCart, Trash2, ArrowRight, Share2 } from "lucide-react";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);

  const handleMoveToCart = (product: any) => {
    addItem(product, 1);
    toggleWishlist(product);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My AUREVO.digital Wishlist",
        text: `Check out the products I saved on AUREVO.digital!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Wishlist link copied to clipboard!");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Wishlist is Empty</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our smart electronics, appliances, and solid wood furniture catalog and save your favourite items.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            My Wishlist ({items.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Saved items for later purchase or wedding package planning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Share2 className="w-4 h-4" />
            Share Wishlist
          </button>
          <button
            onClick={clearWishlist}
            className="text-xs text-red-500 hover:text-red-700 font-semibold p-2"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3 hover:shadow-card transition"
          >
            <div className="relative aspect-square rounded-xl bg-slate-50 p-4">
              <button
                onClick={() => toggleWishlist(prod)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-500 shadow-sm hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <img
                src={
                  prod.images?.[0]?.url ||
                  (typeof prod.images?.[0] === "string" ? prod.images[0] : "") ||
                  "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
                }
                alt={prod.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-brand-blue uppercase">
                {prod.brand?.name}
              </span>
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2">
                {prod.name}
              </h4>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{prod.sellingPrice.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ₹{prod.mrp.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleMoveToCart(prod)}
              className="w-full py-2 bg-brand-blue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
