'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Phone,
  ArrowRight,
  LogOut,
  Package,
} from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MobileDrawer } from './MobileDrawer';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const router = useRouter();
  const { summary, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any>({ products: [], categories: [], brands: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load categories for navigation
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.data.categories);
      })
      .catch(() => {});

    // Check user session
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data.user);
      })
      .catch(() => {});
  }, []);

  // Live autocomplete search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data);
        }
      } catch {
        // Silent error
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-luxury-emerald via-luxury-darkest to-luxury-emerald border-b border-luxury-border/60 py-1.5 sm:py-2 px-3 sm:px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] sm:text-[11px] text-luxury-gold-light tracking-widest uppercase font-medium">
          <span className="hidden md:inline">Complimentary White-Glove Shipping On All Orders Above ₹5,000</span>
          <span className="mx-auto md:mx-0 flex items-center gap-1.5 truncate">
            <Sparkles className="w-3 h-3 text-luxury-gold shrink-0" />
            <span className="truncate">AUREEVO CONCIERGE — THE WORLD OF LUXURY</span>
          </span>
          <a
            href="https://wa.me/912289001200"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1 hover:text-white transition-colors shrink-0"
          >
            <Phone className="w-3 h-3" />
            <span>VIP WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-luxury-darkest/95 backdrop-blur-xl border-b border-luxury-border/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 lg:h-24 flex items-center justify-between gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-luxury-surface/50 border border-luxury-border text-luxury-muted hover:text-white shrink-0"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3.5 shrink-0 group min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden shadow-lg shadow-luxury-gold/15 group-hover:border-luxury-gold transition-colors shrink-0">
              <img
                src="/images/aureevo-logo.png"
                alt="AUREEVO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold font-brand tracking-[0.12em] sm:tracking-[0.2em] text-white truncate">
                AUREEVO
              </h1>
              <p className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.25em] text-luxury-gold-light font-medium truncate block">
                THE WORLD OF LUXURY
              </p>
            </div>
          </Link>

          {/* Desktop Search Bar with Live Autocomplete */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative mx-2 lg:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search formulations, rare essences, SKUs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-luxury-card/90 border border-luxury-border hover:border-luxury-gold/50 focus:border-luxury-gold rounded-full text-xs text-white placeholder-luxury-muted/60 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-luxury-gold absolute left-3.5 top-2.5 sm:top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 sm:top-3 text-luxury-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Live Autocomplete Dropdown */}
            {isSearchOpen && (suggestions.products.length > 0 || suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-luxury-darkest/98 border border-luxury-border rounded-2xl shadow-2xl p-4 space-y-4 z-50 backdrop-blur-2xl">
                {/* Matched Categories */}
                {suggestions.categories.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-muted block mb-2">
                      Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.categories.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="px-2.5 py-1 rounded-lg bg-luxury-emerald/40 border border-luxury-border text-xs text-luxury-gold-light hover:border-luxury-gold"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Brands */}
                {suggestions.brands.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-muted block mb-2">
                      Maisons & Brands
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.brands.map((b: any) => (
                        <Link
                          key={b.id}
                          href={`/brand/${b.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="px-2.5 py-1 rounded-lg bg-luxury-surface/50 border border-luxury-border text-xs text-white hover:border-luxury-gold"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Products */}
                {suggestions.products.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-muted block mb-2">
                      Formulations
                    </span>
                    <div className="space-y-2">
                      {suggestions.products.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-luxury-surface/60 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-luxury-emerald/60 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate group-hover:text-luxury-gold-light">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-luxury-muted font-mono">{p.brandName}</p>
                          </div>
                          <span className="text-xs font-bold font-brand text-luxury-gold shrink-0">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-luxury-border/60 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs text-luxury-gold font-semibold hover:underline"
                  >
                    <span>View all matching results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-1.5 rounded-xl text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/40 transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-1.5 sm:p-2 rounded-xl text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/40 transition-colors shrink-0"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-luxury-gold text-luxury-darkest font-bold text-[9px] sm:text-[10px] flex items-center justify-center shadow">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-xl text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/40 transition-colors flex items-center gap-1.5 shrink-0"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-luxury-gold text-luxury-darkest font-bold text-[9px] sm:text-[10px] flex items-center justify-center shadow">
                  {summary.itemCount}
                </span>
              )}
            </button>

            {/* Customer Account Menu */}
            {user ? (
              <div className="relative group shrink-0">
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-luxury-emerald/50 border border-luxury-gold/40 text-xs text-white hover:border-luxury-gold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-luxury-gold" />
                  <span className="hidden sm:inline font-semibold max-w-[80px] truncate">{user.firstName}</span>
                  <ChevronDown className="w-3 h-3 text-luxury-muted hidden sm:inline" />
                </Link>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-luxury-darkest/98 border border-luxury-border rounded-2xl shadow-2xl py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                  <Link
                    href="/account"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-white hover:bg-luxury-surface/60"
                  >
                    <User className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-white hover:bg-luxury-surface/60"
                  >
                    <Package className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-white hover:bg-luxury-surface/60"
                  >
                    <Heart className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Wishlist</span>
                  </Link>
                  <div className="border-t border-luxury-border/60 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="shrink-0">
                <Link href="/auth/login" className="hidden sm:inline-block">
                  <Button variant="gold" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/auth/login"
                  className="sm:hidden p-1.5 rounded-xl bg-luxury-emerald/50 border border-luxury-gold/40 text-luxury-gold hover:text-white flex items-center justify-center"
                  title="Sign In"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {isSearchOpen && (
          <div className="md:hidden px-3 py-2 bg-luxury-card/95 border-t border-luxury-border">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search formulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-luxury-darkest border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/60 focus:outline-none focus:border-luxury-gold"
              />
              <Search className="w-4 h-4 text-luxury-gold absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-luxury-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Desktop Category Navigation Menu */}
        <nav className="hidden lg:flex items-center justify-center gap-8 px-4 h-12 border-t border-luxury-border/40 bg-luxury-emerald/30 text-xs font-bold uppercase tracking-wider text-luxury-muted">
          <Link href="/shop" className="hover:text-luxury-gold transition-colors">
            All Formulations
          </Link>

          {categories.map((cat) => (
            <div key={cat.id} className="relative group py-3">
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1 hover:text-luxury-gold transition-colors"
              >
                <span>{cat.name}</span>
                {cat.children?.length > 0 && <ChevronDown className="w-3 h-3" />}
              </Link>

              {/* Subcategories Megamenu Dropdown */}
              {cat.children?.length > 0 && (
                <div className="absolute left-0 top-full mt-0 w-64 bg-luxury-darkest/98 border border-luxury-border rounded-2xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 space-y-1">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="block px-3 py-2 rounded-xl text-xs font-bold text-luxury-gold-light hover:bg-luxury-surface/60 border-b border-luxury-border/40 mb-1"
                  >
                    Explore All {cat.name}
                  </Link>
                  {cat.children.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/category/${sub.slug}`}
                      className="block px-3 py-2 rounded-xl text-xs text-white hover:text-luxury-gold hover:bg-luxury-surface/60 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link href="/shop?isFeatured=true" className="text-luxury-gold-light hover:text-white transition-colors">
            Signature Editions
          </Link>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={categories}
        user={user}
        onLogout={handleLogout}
      />

      {/* Shopping Bag Slide-Over Drawer */}
      <CartDrawer />
    </>
  );
}
