"use client";

import React from "react";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Flame,
  Sparkles,
} from "lucide-react";

// 1. Top Horizontal Category Story Circles (AUREEVO Curated Luxury Photography)
const STORY_CATEGORIES = [
  {
    name: "Televisions",
    href: "/category/electronics?sub=led-smart-tvs",
    image: "/images/banners/dept-tv.jpg",
    badge: "Smart 4K",
  },
  {
    name: "Air Conditioners",
    href: "/category/ac-cooling",
    image: "/images/banners/dept-ac.jpg",
    badge: "Inverter",
  },
  {
    name: "Refrigerators",
    href: "/category/refrigeration",
    image: "/images/banners/dept-fridge.jpg",
    badge: "Frost Free",
  },
  {
    name: "Washing Machines",
    href: "/category/washing-cleaning",
    image: "/images/banners/dept-washing.jpg",
    badge: "Front Load",
  },
  {
    name: "Kitchen Luxury",
    href: "/category/kitchen-appliances",
    image: "/images/banners/slider-5.jpg",
    badge: "Chef Edition",
  },
  {
    name: "Furniture Suites",
    href: "/category/furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80",
    badge: "Teakwood",
  },
  {
    name: "Audio & Theatres",
    href: "/category/electronics?sub=soundbars-home-theatre",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
    badge: "Dolby Atmos",
  },
  {
    name: "Wedding Suites",
    href: "/wedding-packages",
    image: "/images/banners/slider-4.jpg",
    badge: "Royal Bundle",
  },
  {
    name: "Festive Deals",
    href: "/deals",
    image: "/images/banners/slider-1.jpg",
    badge: "Up to 55%",
  },
];

// 2. 8 Featured Department Category Banners (Aspect ratio 4:3 / 16:9 matching Kashika 2x4 layout with AUREEVO Brand Palette)
const AUREEVO_DEPARTMENT_BANNERS = [
  {
    title: "Televisions",
    subtitle: "4K OLED, QLED & Smart Displays",
    href: "/category/electronics?sub=led-smart-tvs",
    image: "/images/banners/dept-tv.jpg",
    tag: "Up to 50% Off",
  },
  {
    title: "Air Conditioners",
    subtitle: "Split & Inverter Tropical Cooling",
    href: "/category/ac-cooling",
    image: "/images/banners/dept-ac.jpg",
    tag: "Free Installation",
  },
  {
    title: "Refrigerators",
    subtitle: "French Door & Multi-Door Series",
    href: "/category/refrigeration",
    image: "/images/banners/dept-fridge.jpg",
    tag: "Exchange Bonus",
  },
  {
    title: "Washing Machines",
    subtitle: "Front & Top Load Inverter Washers",
    href: "/category/washing-cleaning",
    image: "/images/banners/dept-washing.jpg",
    tag: "10Y Warranty",
  },
  {
    title: "Kitchen Luxury",
    subtitle: "Glass Hobs, Chimneys & Microwaves",
    href: "/category/kitchen-appliances",
    image: "/images/banners/slider-5.jpg",
    tag: "Chef Grade",
  },
  {
    title: "Soundbars & Audio",
    subtitle: "Cinematic Dolby Soundbars",
    href: "/category/electronics?sub=soundbars-home-theatre",
    image: "/images/banners/slider-2.jpg",
    tag: "Dolby Atmos",
  },
  {
    title: "Royal Furniture",
    subtitle: "Beds, Sofas & Dining Sets",
    href: "/category/furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
    tag: "Solid Wood",
  },
  {
    title: "Wedding Suites",
    subtitle: "Complete Living Room & Kitchen Bundles",
    href: "/wedding-packages",
    image: "/images/banners/slider-4.jpg",
    tag: "Save ₹1,50,000+",
  },
];

// 3. AUREEVO 4 Trust Features (Brand Emerald & Gold Styling)
const TRUST_FEATURES = [
  {
    title: "Free White-Glove Delivery",
    subtitle: "Complimentary doorstep setup across Varanasi & Purvanchal",
    icon: Truck,
    color: "gold",
  },
  {
    title: "7-Day Easy Returns",
    subtitle: "100% brand-certified replacement guarantee",
    icon: RotateCcw,
    color: "emerald",
  },
  {
    title: "24/7 Concierge Support",
    subtitle: "Helpline: 98390 57744 & WhatsApp Desk",
    icon: Headphones,
    color: "gold",
  },
  {
    title: "100% Secure & GST Invoiced",
    subtitle: "Official manufacturer warranty with input tax credits",
    icon: ShieldCheck,
    color: "emerald",
  },
];

// 4. Authorized Brand Partners (Clean Vectors / Badges)
const BRAND_PARTNERS = [
  { name: "Samsung", slug: "samsung", logo: "/images/brands/samsung.svg" },
  { name: "LG", slug: "lg", logo: "/images/brands/lg.svg" },
  { name: "Sony", slug: "sony", logo: "/images/brands/sony.svg" },
  { name: "Whirlpool", slug: "whirlpool", logo: "/images/brands/whirlpool.svg" },
  { name: "Bosch", slug: "bosch", logo: "/images/brands/bosch.svg" },
  { name: "Philips", slug: "philips", logo: "/images/brands/philips.svg" },
  { name: "Voltas", slug: "voltas", logo: "/images/brands/voltas.svg" },
  { name: "Godrej", slug: "godrej", logo: "/images/brands/godrej.svg" },
  { name: "AUREVO Living", slug: "aurevo-living", logo: "/images/brands/aurevo-living.svg" },
];

// A. Top Category Story Circles (horizontal swipe on mobile)
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
              className="flex flex-col items-center gap-1 shrink-0 group w-18 sm:w-22 text-center"
            >
              {/* Circular Thumbnail with Gold/Emerald Border */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] sm:p-[2.5px] bg-gradient-to-tr from-brand-gold via-brand-gold-light to-brand-emerald group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <div className="w-full h-full rounded-full overflow-hidden bg-brand-dark border-2 border-white">
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
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-gold-dark transition line-clamp-1 mt-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// B. 2x4 Category Department Banners with Brand Emerald-Gold Styling
export function CategoryBannerGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-dark font-luxury block">
            Featured Departments
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 font-luxury">
            Shop by Essential Electronics & Appliances
          </h2>
        </div>
        <Link
          href="/category/electronics"
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-brand-emerald hover:text-brand-dark"
        >
          All Departments <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2 columns on mobile (col-6), 4 columns on desktop (col-lg-3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {AUREEVO_DEPARTMENT_BANNERS.map((banner, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-brand-gold/25 hover:border-brand-gold/60 transition-all duration-300 bg-brand-dark"
          >
            <Link href={banner.href} className="block relative overflow-hidden aspect-[4/3] sm:aspect-[4/3]">
              {/* Product Department Showcase Image */}
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                loading="lazy"
              />

              {/* Dark luxury gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-black/30 pointer-events-none" />

              {/* Tag Badge */}
              <span className="absolute top-2.5 left-2.5 bg-brand-gold text-brand-dark text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm font-luxury">
                {banner.tag}
              </span>

              {/* Bottom AUREEVO Brand Emerald-Gold Category Label */}
              <div className="absolute bottom-0 inset-x-0 min-h-[38px] sm:min-h-[42px] bg-gradient-to-r from-brand-dark/95 via-brand-emerald/90 to-brand-dark/95 border-t border-brand-gold/40 text-white flex flex-col items-center justify-center text-center px-2 py-1.5 transition-colors duration-200">
                <span className="font-bold text-xs sm:text-sm text-brand-gold-light group-hover:text-white tracking-wide font-luxury">
                  {banner.title}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-300 hidden sm:block line-clamp-1">
                  {banner.subtitle}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// C. AUREEVO Trust / Value Assurance Bar (Brand Color Matching)
export function TrustFeaturesBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-brand-gold/25 p-5 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {TRUST_FEATURES.map((item, idx) => {
            const Icon = item.icon;
            const isGold = item.color === "gold";
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3 first:pt-0"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border ${
                    isGold
                      ? "bg-brand-gold/15 text-brand-gold-dark border-brand-gold/30"
                      : "bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-luxury">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// D. Brand Partners Showcase
export function BrandPartnersBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-brand-dark rounded-3xl border border-brand-gold/30 p-5 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-gold-light font-luxury">
              Authorized Manufacturer Warranties
            </span>
          </div>
          <span className="text-[11px] text-brand-gold-light/80 font-medium hidden sm:inline">
            100% Genuine Direct Brand Alliances
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {BRAND_PARTNERS.map((brand, idx) => (
            <Link
              key={idx}
              href={`/search?q=${encodeURIComponent(brand.name)}`}
              title={`${brand.name} Authorized Partner`}
              className="group p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-slate-50 border border-brand-gold/25 hover:border-brand-gold flex items-center justify-center min-h-[58px] sm:min-h-[68px] shadow-sm hover:shadow-gold-glow transition-all active:scale-95"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-6 sm:max-h-7 max-w-[85%] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function RetailSections() {
  return (
    <div className="space-y-10">
      <CategoryStoryCircles />
      <CategoryBannerGrid />
      <TrustFeaturesBar />
      <BrandPartnersBar />
    </div>
  );
}
