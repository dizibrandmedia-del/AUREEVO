"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ChevronDown,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCartStore, useWishlistStore, useCompareStore } from "@/lib/store";
import MegaMenu from "./MegaMenu";
import PincodeModal from "./PincodeModal";
import Logo from "@/components/common/Logo";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const compareCount = useCompareStore((s) => s.items.length);
  const currentPincode = useCartStore((s) => s.pincode);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const switchRole = async (targetRole: string) => {
    try {
      const res = await fetch("/api/v1/auth/quick-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setRoleDropdownOpen(false);
        if (targetRole === "SUPER_ADMIN" || targetRole === "ADMIN_MANAGER") {
          router.push("/admin");
        } else if (targetRole === "SALES_MANAGER" || targetRole === "LISTING_EXECUTIVE") {
          router.push("/sales");
        } else {
          router.push("/");
        }
      }
    } catch (err) {}
  };

  return (
    <>
      {/* Top Notification Announcement Bar - Hidden on mobile screens */}
      <div className="hidden md:block bg-brand-dark text-slate-200 text-xs py-2 px-4 border-b border-brand-gold/20 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-brand-gold-light via-brand-gold to-brand-gold-dark text-brand-dark px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
              Royal Edition
            </span>
            <span className="hidden sm:inline text-slate-300 font-medium">
              AUREVO Festive Luxury Season: Up to 55% Off + White Glove Installation Guarantee
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <Link
              href="/wedding-packages"
              className="hover:text-brand-gold-light flex items-center gap-1.5 font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Wedding Package Suites</span>
            </Link>
            <span className="text-emerald-900 hidden sm:inline">|</span>
            <Link
              href="/b2b"
              className="hover:text-brand-gold-light font-medium transition hidden sm:inline"
            >
              Corporate & B2B
            </Link>
            <span className="text-emerald-900 hidden sm:inline">|</span>
            <Link
              href="/track-order"
              className="hover:text-brand-gold-light font-medium transition"
            >
              Track Order
            </Link>
            <span className="text-emerald-900 hidden sm:inline">|</span>
            <a
              href="https://wa.me/919876543210?text=Hi%20AUREVO,%20I%20need%20assistance%20with%20luxury%20shopping"
              target="_blank"
              rel="noreferrer"
              className="text-brand-gold-light hover:text-white flex items-center gap-1 font-semibold"
            >
              <PhoneCall className="w-3 h-3 text-brand-gold" />
              Concierge WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 border-b border-brand-border/60 ${
          isScrolled ? "shadow-md py-2.5" : "py-3 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-xl text-slate-700 hover:bg-brand-bg border border-brand-border"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-brand-dark" /> : <Menu className="w-6 h-6 text-brand-dark" />}
              </button>

              <Logo variant="full" priority />
            </div>

            {/* Smart Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block mx-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 4K OLED TVs, Inverter ACs, French Door Fridges, Teak Beds..."
                  className="w-full pl-11 pr-24 py-2.5 rounded-full border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold text-sm bg-brand-bg/60 hover:bg-white transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-emerald hover:bg-brand-dark text-brand-gold-light border border-brand-gold/40 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition shadow-sm hover:shadow-gold-glow uppercase font-luxury"
                >
                  SEARCH
                </button>
              </form>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Location / Pincode */}
              <button
                onClick={() => setIsPincodeOpen(true)}
                className="hidden lg:flex items-center gap-1.5 text-left text-xs text-slate-700 hover:text-brand-dark px-3 py-1.5 rounded-xl border border-brand-border bg-brand-bg/50 hover:border-brand-gold/50 transition"
              >
                <MapPin className="w-4 h-4 text-brand-gold-dark shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 leading-none">Deliver to</span>
                  <span className="font-bold text-slate-800">{currentPincode || "221001"}</span>
                </div>
              </button>

              {/* Product Comparison (2-4 products) */}
              <Link
                href="/compare"
                className="relative hidden sm:flex items-center gap-1 text-slate-700 hover:text-brand-dark text-xs font-semibold p-2 rounded-xl hover:bg-brand-bg transition border border-transparent hover:border-brand-border"
                title="Product Comparison"
              >
                <Layers className="w-5 h-5 text-slate-600" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-emerald text-brand-gold-light text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-brand-gold/40">
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex items-center text-slate-700 hover:text-brand-dark p-2 rounded-xl hover:bg-brand-bg transition border border-transparent hover:border-brand-border"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 text-slate-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 text-white p-2 sm:px-3.5 sm:py-2 rounded-xl bg-brand-emerald hover:bg-brand-dark transition border border-brand-gold/40 shadow-sm hover:shadow-gold-glow"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-brand-gold-light" />
                <span className="hidden sm:inline font-bold text-xs text-brand-gold-light">Cart</span>
                {cartCount > 0 && (
                  <span className="bg-brand-gold text-brand-dark text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account & Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1 text-slate-700 hover:text-brand-blue p-1.5 rounded-lg hover:bg-slate-100 transition text-xs font-medium"
                >
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="hidden xl:inline font-semibold">
                    {currentUser ? currentUser.name.split(" ")[0] : "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-slate-200 py-2 z-50 text-sm">
                    {currentUser ? (
                      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                        <p className="font-semibold text-slate-900">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-blue">
                          {currentUser.role}
                        </span>
                      </div>
                    ) : (
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">Welcome to AUREVO</p>
                        <p className="text-xs text-slate-500">Access orders & fast checkout</p>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        My Account & Orders
                      </Link>
                      <Link
                        href="/track-order"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Track Order Timeline
                      </Link>
                    </div>

                    {/* RBAC Portal Direct Links */}
                    <div className="border-t border-slate-100 py-1.5 bg-slate-50/50">
                      <div className="px-4 py-1 text-[11px] font-bold uppercase text-slate-400">
                        Portal Navigation
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs text-brand-blue hover:bg-blue-50 font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin ERP Portal
                      </Link>
                      <Link
                        href="/sales"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs text-brand-violet hover:bg-violet-50 font-semibold"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Sales CRM & Listing Portal
                      </Link>
                    </div>

                    {/* Quick Role Switcher for rapid pairing verification */}
                    <div className="border-t border-slate-100 py-1.5">
                      <div className="px-4 py-1 text-[11px] font-bold uppercase text-slate-400">
                        Switch Role (Testing)
                      </div>
                      <button
                        onClick={() => switchRole("SUPER_ADMIN")}
                        className="w-full text-left px-4 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        👑 Super Admin (Full ERP Access)
                      </button>
                      <button
                        onClick={() => switchRole("ADMIN_MANAGER")}
                        className="w-full text-left px-4 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        🛠️ Admin Manager (Stock & Margins)
                      </button>
                      <button
                        onClick={() => switchRole("SALES_MANAGER")}
                        className="w-full text-left px-4 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        💼 Sales Manager (CRM & Quotes)
                      </button>
                      <button
                        onClick={() => switchRole("LISTING_EXECUTIVE")}
                        className="w-full text-left px-4 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        📝 Listing Executive (No Margin Access)
                      </button>
                      <button
                        onClick={() => switchRole("CUSTOMER")}
                        className="w-full text-left px-4 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        👤 Customer View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, models..."
                className="w-full pl-10 pr-20 py-2 rounded-full border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue bg-slate-50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-blue text-white px-3 py-1 rounded-full text-[11px] font-semibold"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Mega Menu Navigation Bar */}
        <MegaMenu />
      </header>

      {/* Pincode Selection Modal */}
      {isPincodeOpen && (
        <PincodeModal onClose={() => setIsPincodeOpen(false)} />
      )}

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
        onPincodeClick={() => setIsPincodeOpen(true)}
        currentPincode={currentPincode}
        switchRole={switchRole}
      />
    </>
  );
}
