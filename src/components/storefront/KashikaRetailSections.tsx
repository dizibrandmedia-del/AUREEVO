"use client";

import React from "react";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  Headphones,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";

// Category Story Circles Data (Horizontal scroll on mobile)
const STORY_CATEGORIES = [
  {
    name: "Televisions",
    href: "/category/electronics?sub=led-smart-tvs",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop&q=80",
    badge: "Smart 4K",
  },
  {
    name: "Air Conditioners",
    href: "/category/ac-cooling?sub=split-inverter-acs",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80",
    badge: "Inverter",
  },
  {
    name: "Refrigerators",
    href: "/category/refrigeration",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&auto=format&fit=crop&q=80",
    badge: "Frost Free",
  },
  {
    name: "Washing Machines",
    href: "/category/washing-cleaning",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&auto=format&fit=crop&q=80",
    badge: "Front Load",
  },
  {
    name: "Kitchen Luxury",
    href: "/category/kitchen-appliances",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80",
    badge: "OTG & Hob",
  },
  {
    name: "Soundbars & Audio",
    href: "/category/electronics?sub=soundbars-home-theatre",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80",
    badge: "Dolby Atmos",
  },
  {
    name: "Furniture Suites",
    href: "/category/furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80",
    badge: "Teakwood",
  },
  {
    name: "Wedding Suites",
    href: "/wedding-packages",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80",
    badge: "Royal Bundle",
  },
  {
    name: "Festive Deals",
    href: "/deals",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80",
    badge: "Up to 55%",
  },
];

// 2x4 Kashika Visual Category Banner Grid
const BANNER_CATEGORIES = [
  {
    title: "Televisions",
    subtitle: "OLED, QLED & 4K Smart TVs",
    tag: "Up to 50% Off",
    href: "/category/electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Air Conditioners",
    subtitle: "Split & Window Inverter ACs",
    tag: "Free Installation",
    href: "/category/ac-cooling",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Refrigerators",
    subtitle: "Side-by-Side & Double Door",
    tag: "Exchange Bonus",
    href: "/category/refrigeration",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Washing Machines",
    subtitle: "Front & Top Load Inverters",
    tag: "10Y Motor Warranty",
    href: "/category/washing-cleaning",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Kitchen Appliances",
    subtitle: "Microwaves, Chimneys & Hobs",
    tag: "Chef Grade",
    href: "/category/kitchen-appliances",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Audio & Entertainment",
    subtitle: "Soundbars, Theatres & Speakers",
    tag: "Cinematic Bass",
    href: "/category/electronics?sub=soundbars-home-theatre",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Living & Furniture",
    subtitle: "King Beds, Sofas & Dining Sets",
    tag: "Solid Wood",
    href: "/category/furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Wedding Packages",
    subtitle: "All-in-One Home Electronic Suites",
    tag: "Save ₹1,50,000+",
    href: "/wedding-packages",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
  },
];

export function CategoryStoryCircles() {
  return (
    <section className="bg-white border-b border-brand-border/60 py-3 sm:py-4 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 font-luxury">
              Browse Categories
            </h2>
          </div>
          <Link
            href="/deals"
            className="text-[11px] text-brand-emerald hover:text-brand-dark font-bold flex items-center gap-1"
          >
            <Flame className="w-3 h-3 text-brand-gold fill-brand-gold" />
            Festive Offers →
          </Link>
        </div>

        {/* Scrollable Story Row */}
        <div className="flex items-start gap-3.5 sm:gap-5 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {STORY_CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="flex flex-col items-center gap-1 shrink-0 group w-16 sm:w-20 text-center"
            >
              {/* Circular Thumbnail with Gradient Ring */}
              <div className="relative w-15 h-15 sm:w-20 sm:h-20 rounded-full p-[2px] sm:p-[2.5px] bg-gradient-to-tr from-brand-gold-light via-brand-gold to-brand-emerald group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                {cat.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-brand-dark text-brand-gold-light text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm border border-brand-gold/30">
                    {cat.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-gold-dark transition line-clamp-1 mt-0.5">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryBannerGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-dark font-luxury block">
            Featured Departments
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900">
            Shop by Essential Electronics & Appliances
          </h2>
        </div>
        <Link
          href="/category/electronics"
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-brand-emerald hover:text-brand-dark"
        >
          All Products <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2 Columns on Mobile, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {BANNER_CATEGORIES.map((banner, idx) => (
          <Link
            key={idx}
            href={banner.href}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-brand-border/70 hover:border-brand-gold/60 transition-all duration-300 aspect-[4/3] flex flex-col justify-end p-3 sm:p-4 bg-slate-900"
          >
            {/* Background Image with Zoom */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              loading="lazy"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Banner Top Badge */}
            <span className="absolute top-2.5 left-2.5 bg-brand-gold text-brand-dark text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm font-luxury">
              {banner.tag}
            </span>

            {/* Banner Title & Subtitle */}
            <div className="relative z-10 space-y-0.5">
              <h3 className="text-white text-xs sm:text-base font-black tracking-tight group-hover:text-brand-gold-light transition">
                {banner.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                {banner.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrustFeaturesBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-brand-border/80 p-5 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y-2 sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Feature 1 */}
          <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center shrink-0 shadow-sm border border-brand-gold/30">
              <Truck className="w-5 h-5 text-brand-gold-dark" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 font-luxury">
                Free Delivery
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500">
                White glove delivery across Varanasi & Purvanchal
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center shrink-0 shadow-sm border border-brand-emerald/30">
              <RotateCcw className="w-5 h-5 text-brand-emerald" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 font-luxury">
                Easy Returns
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500">
                7-Day brand-certified replacement guarantee
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
              <Headphones className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 font-luxury">
                24/7 Support
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500">
                Helpline: 98390 57744 &amp; WhatsApp Desk
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 font-luxury">
                100% Secure
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500">
                Official GST billing &amp; company warranty
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function KashikaRetailSections() {
  return (
    <div className="space-y-10">
      <CategoryStoryCircles />
      <CategoryBannerGrid />
      <TrustFeaturesBar />
    </div>
  );
}
