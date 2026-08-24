'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sparkles, User, ShoppingBag, Heart, Phone, ChevronRight, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  user: any;
  onLogout: () => void;
}

export function MobileDrawer({ isOpen, onClose, categories, user, onLogout }: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-luxury-darkest border-r border-luxury-border shadow-2xl flex flex-col z-10 animate-slide-in-left pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {/* Header */}
        <div className="p-5 border-b border-luxury-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/images/aureevo-logo.png" alt="AUREEVO" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold font-brand tracking-widest text-white text-base block">
                AUREEVO
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-luxury-gold-light">
                THE WORLD OF LUXURY
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-luxury-muted hover:text-white bg-luxury-surface/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card / Auth */}
        <div className="p-4 bg-luxury-emerald/30 border-b border-luxury-border/60">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-luxury-muted block">Signed in as:</span>
                <span className="text-sm font-bold text-white">{user.firstName} {user.lastName}</span>
              </div>
              <Link href="/account" onClick={onClose}>
                <Button variant="outline" size="sm">
                  Account
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" onClick={onClose} className="flex-1">
                <Button variant="gold" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={onClose} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-muted block mb-2">
              Haute Collections
            </span>
            <div className="space-y-1">
              <Link
                href="/shop"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-luxury-surface/60 text-xs font-semibold text-white"
              >
                <span>All Formulations</span>
                <ChevronRight className="w-4 h-4 text-luxury-gold" />
              </Link>

              {categories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-luxury-surface/60 text-xs font-semibold text-white"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-luxury-gold" />
                  </Link>
                  {cat.children?.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {cat.children.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          onClick={onClose}
                          className="block p-2 rounded-lg text-[11px] text-luxury-muted hover:text-luxury-gold-light hover:bg-luxury-surface/40"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-luxury-border/60">
            <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-muted block mb-2">
              Concierge Services
            </span>
            <div className="space-y-1">
              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-luxury-surface/60 text-xs text-white"
              >
                <Heart className="w-4 h-4 text-luxury-gold" />
                <span>My Wishlist</span>
              </Link>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-luxury-surface/60 text-xs text-white"
              >
                <Package className="w-4 h-4 text-luxury-gold" />
                <span>Track Orders</span>
              </Link>
              <a
                href="https://wa.me/912289001200"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-luxury-surface/60 text-xs text-luxury-gold-light"
              >
                <Phone className="w-4 h-4 text-luxury-gold" />
                <span>WhatsApp VIP Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        {user && (
          <div className="p-4 border-t border-luxury-border/60">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-400 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
