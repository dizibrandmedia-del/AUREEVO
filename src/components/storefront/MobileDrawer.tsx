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
  ExternalLink,
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
  switchRole: (role: string) => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  currentUser,
  onPincodeClick,
  currentPincode,
  switchRole,
}: MobileDrawerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const compareCount = useCompareStore((s) => s.items.length);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-brand-dark/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[88%] max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="bg-brand-dark px-4 py-3.5 flex items-center justify-between border-b border-brand-gold/25">
          <div className="flex items-center gap-2.5">
            <Logo variant="icon" size="sm" />
            <div className="leading-tight">
              <span className="font-luxury font-black tracking-widest text-brand-gold text-base block">
                AUREVO
              </span>
              <span className="text-[9px] text-brand-gold/70 tracking-widest uppercase block">
                The World of Luxury
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-brand-gold-light" />
          </button>
        </div>

        {/* Deliver to Pincode Bar */}
        <div
          onClick={() => {
            onClose();
            onPincodeClick();
          }}
          className="bg-brand-emerald text-white px-4 py-2 flex items-center justify-between cursor-pointer border-b border-brand-gold/20 hover:bg-brand-dark transition"
        >
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
            <span className="text-slate-300 text-xs">Deliver to:</span>
            <span className="font-bold text-brand-gold-light">{currentPincode || "221001"}</span>
          </div>
          <span className="text-[11px] text-brand-gold underline font-semibold">Change</span>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {/* Quick Access Tiles */}
          <div className="p-3 grid grid-cols-2 gap-2 bg-slate-50/70">
            <Link
              href="/wedding-packages"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-brand-gold/20 border border-brand-gold/40 text-brand-dark hover:shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-brand-gold-dark shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Royal Suites
                </span>
                <span className="text-xs font-bold text-slate-900 leading-tight">Wedding Packages</span>
              </div>
            </Link>

            <Link
              href="/track-order"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-emerald transition"
            >
              <Package className="w-4 h-4 text-brand-emerald shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Live Status</span>
                <span className="text-xs font-bold text-slate-900 leading-tight">Track Order</span>
              </div>
            </Link>

            <Link
              href="/b2b"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-emerald transition"
            >
              <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Bulk & GST</span>
                <span className="text-xs font-bold text-slate-900 leading-tight">Corporate B2B</span>
              </div>
            </Link>

            <Link
              href="/compare"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-brand-emerald transition relative"
            >
              <Layers className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Specs Compare</span>
                <span className="text-xs font-bold text-slate-900 leading-tight">Comparison</span>
              </div>
              {compareCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brand-emerald text-brand-gold-light text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>
          </div>

          {/* Categories Accordion Section */}
          <div className="py-2">
            <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Shop Luxury Categories
            </div>

            <nav className="space-y-0.5 px-2">
              {MENU_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isExpanded = expandedCategory === cat.slug;
                const hasSub = Boolean(cat.columns && cat.columns.length > 0);

                return (
                  <div key={cat.slug} className="rounded-xl overflow-hidden">
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                        isExpanded
                          ? "bg-brand-emerald text-white font-semibold"
                          : cat.highlight
                          ? "bg-amber-500/10 text-amber-800 font-bold border border-amber-300"
                          : "hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <Link
                        href={cat.slug === "deals" ? "/deals" : `/category/${cat.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 flex-1 text-sm font-medium"
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isExpanded
                              ? "text-brand-gold-light"
                              : cat.highlight
                              ? "text-amber-600"
                              : "text-brand-emerald"
                          }`}
                        />
                        <span>{cat.name}</span>
                        {cat.highlight && (
                          <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            Hot
                          </span>
                        )}
                      </Link>

                      {hasSub && (
                        <button
                          onClick={() => toggleCategory(cat.slug)}
                          className={`p-1 rounded-lg transition ${
                            isExpanded ? "text-brand-gold-light bg-white/10" : "text-slate-400 hover:text-slate-700"
                          }`}
                          aria-label={`Toggle ${cat.name} subcategories`}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Expandable Subcategory List */}
                    {hasSub && isExpanded && (
                      <div className="bg-slate-50 px-3 py-2 space-y-3 rounded-b-xl border border-t-0 border-brand-border">
                        {cat.columns?.map((col, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark block px-1">
                              {col.title}
                            </span>
                            <ul className="space-y-1">
                              {col.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center justify-between px-2 py-1 text-xs text-slate-600 hover:text-brand-emerald hover:bg-slate-200/60 rounded-md transition"
                                  >
                                    <span>{item.name}</span>
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        <div className="pt-1 border-t border-slate-200">
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={onClose}
                            className="block text-center text-xs font-bold text-brand-emerald hover:underline py-1"
                          >
                            View All {cat.name} →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Quick Account, Wishlist & Cart Shortcuts */}
          <div className="py-3 px-3 space-y-1 bg-slate-50/50">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Account & Activity
            </div>

            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold">
                  {currentUser ? `Hello, ${currentUser.name.split(" ")[0]}` : "My Account & Orders"}
                </span>
              </div>
              {currentUser && (
                <span className="text-[10px] font-bold bg-brand-emerald text-brand-gold-light px-2 py-0.5 rounded">
                  {currentUser.role}
                </span>
              )}
            </Link>

            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold">Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-semibold">Shopping Bag</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-brand-emerald text-brand-gold-light text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount} items
                </span>
              )}
            </Link>
          </div>

          {/* Admin & Staff Portals (Fast Direct Navigation) */}
          <div className="py-3 px-3 space-y-1">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Staff & Management Portals
            </div>

            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 text-brand-blue border border-blue-200 font-semibold text-xs hover:bg-blue-100 transition"
            >
              <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Admin ERP Portal</span>
            </Link>

            <Link
              href="/sales"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50 text-brand-violet border border-purple-200 font-semibold text-xs hover:bg-purple-100 transition"
            >
              <Zap className="w-4 h-4 text-brand-violet shrink-0" />
              <span>Sales CRM & Quotes</span>
            </Link>

            {/* Quick Testing Role Switcher */}
            <div className="pt-2">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="w-full flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2 py-1.5 rounded hover:bg-slate-100"
              >
                <span>🧪 Quick Role Switcher (Testing)</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showRoleSwitcher ? "rotate-180" : ""}`}
                />
              </button>

              {showRoleSwitcher && (
                <div className="space-y-1 mt-1 p-2 bg-slate-100 rounded-lg text-xs">
                  <button
                    onClick={() => {
                      switchRole("SUPER_ADMIN");
                      onClose();
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-white text-slate-700"
                  >
                    👑 Super Admin
                  </button>
                  <button
                    onClick={() => {
                      switchRole("ADMIN_MANAGER");
                      onClose();
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-white text-slate-700"
                  >
                    🛠️ Admin Manager
                  </button>
                  <button
                    onClick={() => {
                      switchRole("SALES_MANAGER");
                      onClose();
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-white text-slate-700"
                  >
                    💼 Sales Manager
                  </button>
                  <button
                    onClick={() => {
                      switchRole("CUSTOMER");
                      onClose();
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-white text-slate-700"
                  >
                    👤 Customer View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer with VIP Concierge Support */}
        <div className="bg-brand-dark text-slate-300 p-4 border-t border-brand-gold/25 space-y-2">
          <a
            href="https://wa.me/919876543210?text=Hi%20AUREVO,%20I%20need%20assistance%20with%20luxury%20shopping"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-brand-gold to-brand-gold-light text-brand-dark rounded-xl font-bold text-xs shadow-md"
          >
            <PhoneCall className="w-4 h-4 text-brand-dark" />
            <span>Chat with VIP Concierge</span>
          </a>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
            <span>📞 +91 98765 43210</span>
            <span>100% Genuine Luxury</span>
          </div>
        </div>
      </aside>
    </>
  );
}
