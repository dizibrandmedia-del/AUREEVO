'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
  };

  return (
    <footer className="mt-auto bg-luxury-darkest border-t border-luxury-border/80 text-luxury-text selection:bg-luxury-gold selection:text-luxury-darkest">
      {/* Trust Pillars Grid */}
      <div className="border-b border-luxury-border/60 bg-luxury-emerald/20 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-luxury-surface/30 border border-luxury-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-brand text-white uppercase tracking-wider">
                100% Authentic Maison
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Direct harvest from Swiss & French cosmetic laboratories.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-luxury-surface/30 border border-luxury-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-brand text-white uppercase tracking-wider">
                White-Glove Delivery
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Complimentary tamper-proof dispatch above ₹5,000.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-luxury-surface/30 border border-luxury-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-brand text-white uppercase tracking-wider">
                VIP Concierge 24/7
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Dedicated luxury skincare and perfumery consultants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-luxury-surface/30 border border-luxury-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-brand text-white uppercase tracking-wider">
                Encrypted Checkout
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Bank-grade 256-bit encryption for all luxury transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-14 h-14 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden shadow-xl shadow-luxury-gold/15 shrink-0">
                <img src="/images/aureevo-logo.png" alt="AUREEVO" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-bold font-brand tracking-[0.2em] text-white block">
                  AUREEVO
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold-light font-medium">
                  THE WORLD OF LUXURY
                </span>
              </div>
            </Link>

            <p className="text-xs text-luxury-muted leading-relaxed max-w-sm">
              AUREEVO is an haute multi-category luxury platform curating the pinnacle of botanical alchemical formulations, cellular longevity, and rare artisanal perfumes.
            </p>

            <div className="pt-2 text-xs space-y-1 text-luxury-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                <span>Level 14, The Oberoi Grand Arcade, Nariman Point, Mumbai</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                <span>concierge@aureevo.com</span>
              </div>
            </div>
          </div>

          {/* Haute Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-brand uppercase tracking-widest text-white">
              Haute Collections
            </h4>
            <ul className="space-y-2 text-xs text-luxury-muted">
              <li>
                <Link href="/shop" className="hover:text-luxury-gold transition-colors">
                  All Formulations
                </Link>
              </li>
              <li>
                <Link href="/category/skincare" className="hover:text-luxury-gold transition-colors">
                  Cellular Skincare
                </Link>
              </li>
              <li>
                <Link href="/category/fragrance" className="hover:text-luxury-gold transition-colors">
                  Haute Parfumerie
                </Link>
              </li>
              <li>
                <Link href="/category/makeup" className="hover:text-luxury-gold transition-colors">
                  Luxury Cosmetics
                </Link>
              </li>
              <li>
                <Link href="/shop?isFeatured=true" className="hover:text-luxury-gold transition-colors">
                  Signature Editions
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-brand uppercase tracking-widest text-white">
              Client Concierge
            </h4>
            <ul className="space-y-2 text-xs text-luxury-muted">
              <li>
                <Link href="/account" className="hover:text-luxury-gold transition-colors">
                  Clientèle Portal
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-luxury-gold transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-luxury-gold transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/912289001200"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-luxury-gold transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-luxury-gold" />
                  <span>WhatsApp Concierge</span>
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-luxury-gold-light hover:underline font-semibold">
                  Administrator Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* Private Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-brand uppercase tracking-widest text-white">
              Private Clientèle Circle
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Receive private invitations to limited batch harvests and formulation masterclasses.
            </p>

            {isSubscribed ? (
              <div className="p-3 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 text-xs text-luxury-gold-light flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                <span>You are on the Private Invitation Roster.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-luxury-card/90 border border-luxury-border focus:border-luxury-gold rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none"
                  required
                />
                <Button type="submit" variant="gold" size="sm" className="w-full">
                  Request Invitation
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-luxury-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-luxury-muted">
          <span>
            © {new Date().getFullYear()} AUREEVO Luxury Retail Private Limited. All Rights Reserved.
          </span>
          <div className="flex items-center gap-4 text-luxury-muted">
            <span>Privacy Charter</span>
            <span>•</span>
            <span>Terms of Haute Service</span>
            <span>•</span>
            <span>Authenticity Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
