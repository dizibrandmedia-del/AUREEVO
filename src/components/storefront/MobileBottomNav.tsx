"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Layers,
  Search,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";

interface MobileBottomNavProps {
  onOpenCategories: () => void;
  onFocusSearch: () => void;
}

export default function MobileBottomNav({
  onOpenCategories,
  onFocusSearch,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-dark/95 backdrop-blur-md border-t border-brand-gold/25 px-2 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            pathname === "/"
              ? "text-brand-gold font-bold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Categories Drawer */}
        <button
          type="button"
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-300 hover:text-white transition active:scale-95"
        >
          <Layers className="w-5 h-5 mb-0.5 text-brand-gold-light" />
          <span className="text-[10px] tracking-tight">Categories</span>
        </button>

        {/* 3. Search */}
        <button
          type="button"
          onClick={onFocusSearch}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-300 hover:text-white transition active:scale-95"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* 4. Wishlist */}
        <Link
          href="/wishlist"
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            pathname === "/wishlist"
              ? "text-brand-gold font-bold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Heart className="w-5 h-5 mb-0.5 text-rose-400" />
          {wishlistCount > 0 && (
            <span className="absolute 1 top-0 right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] tracking-tight">Wishlist</span>
        </Link>

        {/* 5. Cart */}
        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            pathname === "/cart"
              ? "text-brand-gold font-bold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5 text-brand-gold" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 bg-brand-gold text-brand-dark text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] tracking-tight">Bag</span>
        </Link>
      </div>
    </nav>
  );
}
