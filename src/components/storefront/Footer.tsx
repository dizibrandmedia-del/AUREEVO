import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  PhoneCall,
  Mail,
  MapPin,
  Lock,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-10 border-t border-brand-gold/25 mt-20 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 4 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-brand-gold/20">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-brand-gold/20">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0 border border-brand-gold/30">
              <ShieldCheck className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-luxury">100% Genuine Brands</h4>
              <p className="text-xs text-slate-400">Authorized manufacturer warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-brand-gold/20">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0 border border-brand-gold/30">
              <Truck className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-luxury">White Glove Delivery</h4>
              <p className="text-xs text-slate-400">Scheduled delivery with unboxing</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-brand-gold/20">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0 border border-brand-gold/30">
              <RotateCcw className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-luxury">7-Day Royal Guarantee</h4>
              <p className="text-xs text-slate-400">Direct replacement & resolution</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-brand-gold/20">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0 border border-brand-gold/30">
              <Headphones className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-luxury">Private Concierge</h4>
              <p className="text-xs text-slate-400">Dedicated phone & WhatsApp desk</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12 border-b border-brand-gold/20 text-xs">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Logo variant="full" />
            <p className="text-slate-400 leading-relaxed max-w-sm mt-2">
              The World of Luxury. India&apos;s premier digital marketplace for 4K OLED Smart TVs, Dual Inverter ACs, French Door Refrigerators, Smart Washers, Handcrafted Teakwood Furniture, and All-in-One Wedding Home Suites.
            </p>
            <div className="space-y-2 text-slate-300 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                Varanasi Regional Fulfilment Center, Sigra, Varanasi, UP - 221010
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-brand-gold" />
                Helpline: +91 98765 43210 (9:00 AM – 9:00 PM IST)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-gold" />
                Email: support@aurevo.digital | corporate@aurevo.digital
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-luxury font-bold text-xs uppercase tracking-widest text-brand-gold-light">Top Collections</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/category/electronics" className="hover:text-brand-gold-light transition">4K OLED & Smart TVs</Link></li>
              <li><Link href="/category/ac-cooling" className="hover:text-brand-gold-light transition">Inverter Split ACs</Link></li>
              <li><Link href="/category/refrigeration" className="hover:text-brand-gold-light transition">French Door Refrigerators</Link></li>
              <li><Link href="/category/washing-cleaning" className="hover:text-brand-gold-light transition">Front Load Washers</Link></li>
              <li><Link href="/category/kitchen-appliances" className="hover:text-brand-gold-light transition">Kitchen Chimneys & Microwaves</Link></li>
              <li><Link href="/category/furniture" className="hover:text-brand-gold-light transition">Hydraulic Teakwood Beds</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-luxury font-bold text-xs uppercase tracking-widest text-brand-gold-light">Customer Concierge</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/track-order" className="hover:text-brand-gold-light transition">Track Your Order</Link></li>
              <li><Link href="/account" className="hover:text-brand-gold-light transition">My Account & Invoices</Link></li>
              <li><Link href="/compare" className="hover:text-brand-gold-light transition">Compare Products</Link></li>
              <li><Link href="/wishlist" className="hover:text-brand-gold-light transition">Saved Wishlist</Link></li>
              <li><Link href="/wedding-packages" className="hover:text-brand-gold-light transition">Wedding Package Suites</Link></li>
              <li><Link href="/b2b" className="hover:text-brand-gold-light transition">Bulk & Corporate Orders</Link></li>
            </ul>
          </div>

          {/* Business & Portals */}
          <div className="space-y-3">
            <h4 className="font-luxury font-bold text-xs uppercase tracking-widest text-brand-gold-light">Operations Portals</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/admin" className="text-brand-gold-light hover:underline font-semibold flex items-center gap-1">
                  🛡️ Admin ERP Portal
                </Link>
              </li>
              <li>
                <Link href="/sales" className="text-brand-gold-light hover:underline font-semibold flex items-center gap-1">
                  💼 Sales CRM & Quotations
                </Link>
              </li>
              <li>
                <Link href="/sales/listing" className="hover:text-white transition">
                  Listing Team Workspace
                </Link>
              </li>
              <li>
                <Link href="/admin/pricing-margins" className="hover:text-white transition">
                  Pricing & Margin Engine
                </Link>
              </li>
              <li>
                <Link href="/admin/returns" className="hover:text-white transition">
                  Returns & Warranty Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-brand-gold" />
            <span>256-Bit SSL Encrypted • GST Compliant • 100% Authorized Products</span>
          </div>

          <p className="text-center md:text-right text-slate-400">
            © {new Date().getFullYear()} AUREVO.digital. The World of Luxury. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
