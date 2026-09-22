"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  MapPin,
  Sparkles,
  PhoneCall,
  ChevronDown,
  ChevronRight,
  Layers,
  Heart,
  ShoppingCart,
  User,
  ShieldCheck,
  Zap,
  Package,
  Building2,
  Phone,
  Flame,
  CheckCircle2,
} from "lucide-react";
import Logo from "@/components/common/Logo";
import { MENU_CATEGORIES } from "./MegaMenu";
import { useWishlistStore, useCompareStore, useCartStore } from "@/lib/store";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onPincodeClick: () => void;
  currentPincode: string;
  switchRole?: (role: string) => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  currentUser,
  onPincodeClick,
  currentPincode,
}: MobileDrawerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const compareCount = useCompareStore((s) => s.items.length);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  const toggleCategory = (slug: string) => {
    setExpandedCategory((prev) => (prev === slug ? null : slug));
  };

  const getCategoryHref = (slug: string) => {
    if (slug === "wedding-packages") return "/wedding-packages";
    if (slug === "deals") return "/deals";
    return `/category/${slug}`;
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[88%] max-w-sm bg-white z-[100] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="bg-brand-dark px-4 py-3.5 flex items-center justify-between border-b border-brand-gold/25 shrink-0">
          <div className="flex items-center gap-2.5">
            <Logo variant="icon" size="sm" />
            <div className="leading-tight">
              <span className="font-luxury font-black tracking-widest text-brand-gold text-base block">
                AUREVO
              </span>
              <span className="text-[9px] text-brand-gold/70 tracking-widest uppercase block font-semibold">
                The World of Luxury
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10 active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-brand-gold-light" />
          </button>
        </div>

        {/* Deliver to Pincode Bar */}
        <button
          type="button"
          onClick={() => {
            onClose();
            setTimeout(() => {
              onPincodeClick();
            }, 150);
          }}
          className="w-full bg-brand-emerald text-white px-4 py-2.5 flex items-center justify-between cursor-pointer border-b border-brand-gold/20 hover:bg-brand-dark transition text-left shrink-0"
        >
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
            <span className="text-slate-300 text-xs">Deliver to:</span>
            <span className="font-bold text-brand-gold-light tracking-wide">{currentPincode || "221001"}</span>
          </div>
          <span className="text-[11px] text-brand-gold underline font-semibold">Change</span>
        </button>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 pb-6">
          {/* Quick Access Tiles (2x2 Grid) */}
          <div className="p-3 grid grid-cols-2 gap-2 bg-slate-50/80">
            <Link
              href="/wedding-packages"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-brand-gold/20 border border-brand-gold/40 text-brand-dark hover:shadow-sm active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] font-black uppercase tracking-wider text-amber-700">
                  Royal Suites
                </span>
                <span className="text-xs font-bold text-slate-900 leading-tight block">Wedding Combos</span>
              </div>
            </Link>

            <Link
              href="/track-order"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-emerald active:scale-95 transition shadow-xs"
            >
              <Package className="w-4 h-4 text-brand-emerald shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Live Status</span>
                <span className="text-xs font-bold text-slate-900 leading-tight block">Track Order</span>
              </div>
            </Link>

            <Link
              href="/b2b"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-emerald active:scale-95 transition shadow-xs"
            >
              <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Bulk & GST</span>
                <span className="text-xs font-bold text-slate-900 leading-tight block">Corporate B2B</span>
              </div>
            </Link>

            <Link
              href="/compare"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-emerald active:scale-95 transition relative shadow-xs"
            >
              <Layers className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Specs Compare</span>
                <span className="text-xs font-bold text-slate-900 leading-tight block">Compare (2-4)</span>
              </div>
              {compareCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brand-emerald text-brand-gold-light text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>
          </div>

          {/* Categories Section */}
          <div className="py-2.5">
            <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>Explore Categories</span>
              <span className="text-[9px] font-medium text-slate-400">Tap to expand</span>
            </div>

            <nav className="space-y-1 px-2 mt-1">
              {MENU_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isExpanded = expandedCategory === cat.slug;
                const hasSub = Boolean(cat.columns && cat.columns.length > 0);
                const targetHref = getCategoryHref(cat.slug);

                // For items with subcategories: tapping row toggles accordion
                if (hasSub) {
                  return (
                    <div key={cat.slug} className="rounded-xl overflow-hidden border border-transparent">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-left active:scale-[0.99] ${
                          isExpanded
                            ? "bg-brand-emerald text-white font-semibold shadow-sm"
                            : cat.highlight
                            ? "bg-amber-500/10 text-amber-900 font-bold border border-amber-300"
                            : "hover:bg-slate-100 text-slate-800 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 text-sm font-medium">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isExpanded
                                ? "text-brand-gold-light"
                                : cat.highlight
                                ? "text-amber-600"
                                : "text-brand-emerald"
                            }`}
                          />
                          <span className="font-semibold text-xs sm:text-sm">{cat.name}</span>
                          {cat.highlight && (
                            <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase">
                              HOT
                            </span>
                          )}
                        </div>

                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-brand-gold-light" : "text-slate-400"
                          }`}
                        />
                      </button>

                      {/* Expandable Subcategory List */}
                      {isExpanded && (
                        <div className="bg-slate-50 px-3 py-2.5 space-y-3 rounded-b-xl border border-t-0 border-slate-200 animate-fadeIn">
                          {/* Top Quick Link to Category */}
                          <Link
                            href={targetHref}
                            onClick={onClose}
                            className="block text-center text-xs font-bold text-brand-emerald bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 rounded-lg py-2 px-3 transition shadow-xs"
                          >
                            Explore All {cat.name} Products →
                          </Link>

                          {cat.columns?.map((col, idx) => (
                            <div key={idx} className="space-y-1 pt-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-brand-gold-dark block px-1">
                                {col.title}
                              </span>
                              <ul className="space-y-1">
                                {col.items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <Link
                                      href={item.href}
                                      onClick={onClose}
                                      className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 hover:text-brand-emerald hover:bg-slate-200/60 rounded-lg transition active:bg-slate-200"
                                    >
                                      <span className="font-medium">{item.name}</span>
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // For items without subcategories (e.g. Festive Deals, direct links)
                return (
                  <div key={cat.slug} className="rounded-xl overflow-hidden">
                    <Link
                      href={targetHref}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition text-sm font-medium active:scale-[0.99] ${
                        cat.highlight
                          ? "bg-amber-500/15 text-amber-900 font-black border border-amber-400/50 shadow-xs"
                          : "hover:bg-slate-100 text-slate-800 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-xs sm:text-sm">{cat.name}</span>
                        {cat.highlight && (
                          <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full uppercase">
                            55% OFF
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Quick Account, Wishlist & Cart Shortcuts */}
          <div className="py-3 px-3 space-y-1 bg-slate-50/50">
            <div className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Account & Activity
            </div>

            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-slate-800 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-xs font-semibold">
                  {currentUser ? `Hello, ${currentUser.name.split(" ")[0]}` : "My Account & Orders"}
                </span>
              </div>
              {currentUser ? (
                <span className="text-[9px] font-bold bg-brand-emerald text-brand-gold-light px-2 py-0.5 rounded">
                  {currentUser.role}
                </span>
              ) : (
                <span className="text-[10px] text-brand-gold-dark font-bold">Login / View</span>
              )}
            </Link>

            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-slate-800 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-semibold">Saved Wishlist</span>
              </div>
              {wishlistCount > 0 ? (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">0 items</span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-slate-800 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-brand-emerald shrink-0" />
                <span className="text-xs font-semibold">Shopping Bag</span>
              </div>
              {cartCount > 0 ? (
                <span className="bg-brand-emerald text-brand-gold-light text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount} items
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Empty</span>
              )}
            </Link>
          </div>

          {/* Admin & Staff Portals (Only visible to authenticated staff members) */}
          {currentUser && ["SUPER_ADMIN", "ADMIN_MANAGER", "SALES_MANAGER", "LISTING_EXECUTIVE"].includes(currentUser.role) && (
            <div className="py-3 px-3 space-y-1.5 border-t border-slate-100">
              <div className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Staff & Management Portals
              </div>

              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-xs hover:bg-emerald-100 transition active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Admin ERP Portal</span>
              </Link>

              <Link
                href="/sales"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-xs hover:bg-amber-100 transition active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Sales CRM & Quotes</span>
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Footer with VIP Concierge Support & Call */}
        <div className="bg-brand-dark text-slate-300 p-4 border-t border-brand-gold/25 space-y-2 shrink-0">
          <a
            href="https://wa.me/919876543210?text=Hi%20AUREVO,%20I%20need%20assistance%20with%20luxury%20shopping"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-brand-gold to-brand-gold-light text-brand-dark rounded-xl font-bold text-xs shadow-md active:scale-95 transition"
          >
            <PhoneCall className="w-4 h-4 text-brand-dark shrink-0" />
            <span>Chat with VIP Concierge</span>
          </a>

          <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 pt-1">
            <a href="tel:+919876543210" className="hover:text-brand-gold-light flex items-center gap-1 font-semibold">
              <Phone className="w-3 h-3 text-brand-gold" />
              +91 98765 43210
            </a>
            <span className="text-[10px] text-slate-400">100% Genuine Luxury</span>
          </div>
        </div>
      </aside>
    </>
  );
}
