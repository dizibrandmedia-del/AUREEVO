"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

// 1. Exact Category Story Circles
const STORY_CATEGORIES = [
  {
    name: "TV & Entertainment",
    href: "/category/electronics?sub=led-smart-tvs",
    image: "/images/kashika/cat-tv.jpg",
    badge: "Smart 4K",
  },
  {
    name: "Washing Machines",
    href: "/category/washing-cleaning",
    image: "/images/kashika/cat-washing.jpg",
    badge: "Front Load",
  },
  {
    name: "Kitchen Appliances",
    href: "/category/kitchen-appliances",
    image: "/images/kashika/cat-kitchen.jpg",
    badge: "Chimneys & OTG",
  },
  {
    name: "Laptop & Tech",
    href: "/category/electronics",
    image: "/images/kashika/cat-laptop.jpg",
    badge: "Printers",
  },
  {
    name: "Personal Care",
    href: "/category/electronics",
    image: "/images/kashika/cat-care.jpg",
    badge: "Grooming",
  },
  {
    name: "Furniture Suites",
    href: "/category/furniture",
    image: "/images/kashika/cat-furniture.jpg",
    badge: "Teakwood",
  },
  {
    name: "Accessories & Audio",
    href: "/category/electronics?sub=soundbars-home-theatre",
    image: "/images/kashika/cat-accessories.png",
    badge: "Dolby Bass",
  },
  {
    name: "Wedding Suites",
    href: "/wedding-packages",
    image: "/images/kashika/slider-5.png",
    badge: "Royal Bundle",
  },
  {
    name: "Festive Offers",
    href: "/deals",
    image: "/images/kashika/slider-1.jpg",
    badge: "Up to 55%",
  },
];

// 2. Exact 8 Kashika Category Banners (450x250 aspect ratio)
const KASHIKA_BANNERS = [
  {
    title: "Televisions",
    href: "/category/electronics?sub=led-smart-tvs",
    image: "/images/kashika/banner-televisions.jpg",
    tag: "Smart LED & OLED",
  },
  {
    title: "Air Conditioner",
    href: "/category/ac-cooling",
    image: "/images/kashika/banner-ac.jpg",
    tag: "Split & Window Inverter",
  },
  {
    title: "Home Appliances",
    href: "/category/washing-cleaning",
    image: "/images/kashika/banner-appliances.jpg",
    tag: "Refrigerators & Washers",
  },
  {
    title: "Water Purifier",
    href: "/category/kitchen-appliances",
    image: "/images/kashika/banner-waterpurifier.jpg",
    tag: "RO & UV Purifiers",
  },
  {
    title: "Kitchen Appliances",
    href: "/category/kitchen-appliances",
    image: "/images/kashika/banner-kitchen.jpg",
    tag: "Hobs, Chimneys & Microwaves",
  },
  {
    title: "Laptop & Printer",
    href: "/category/electronics",
    image: "/images/kashika/banner-laptop.jpg",
    tag: "Computing & Office",
  },
  {
    title: "Furniture",
    href: "/category/furniture",
    image: "/images/kashika/banner-furniture.jpg",
    tag: "Beds, Sofas & Dining Sets",
  },
  {
    title: "Mobile & Tablets",
    href: "/category/electronics",
    image: "/images/kashika/banner-mobile.jpg",
    tag: "5G Smartphones & Audio",
  },
];

// 3. Exact 4 Kashika Trust Features
const TRUST_FEATURES = [
  {
    title: "Free Shipping",
    subtitle: "On all orders across Varanasi & Purvanchal",
    icon: "/images/kashika/trust-shipping.png",
  },
  {
    title: "Free Returns",
    subtitle: "Returns are free within 7 days",
    icon: "/images/kashika/trust-returns.png",
  },
  {
    title: "Support 24/7",
    subtitle: "Helpline: 98390 57744 & WhatsApp Desk",
    icon: "/images/kashika/trust-support.png",
  },
  {
    title: "100% Payment Secure",
    subtitle: "Your payments are safe with GST billing",
    icon: "/images/kashika/trust-secure.png",
  },
];

// 4. Exact Kashika Brand Logos
const BRAND_LOGOS = [
  "/images/kashika/brand-1.jpg",
  "/images/kashika/brand-2.jpg",
  "/images/kashika/brand-3.jpg",
  "/images/kashika/brand-4.jpg",
  "/images/kashika/brand-5.jpg",
  "/images/kashika/brand-1.jpg",
  "/images/kashika/brand-2.jpg",
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

// B. Exact 2x4 Kashika Category Banners (450x250)
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
          All Departments <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Kashika Layout: col-6 on mobile (2 columns), col-lg-3 on desktop (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {KASHIKA_BANNERS.map((banner, idx) => (
          <div key={idx} className="banner-wrapper group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-200 transition-all duration-300 bg-white">
            <Link href={banner.href} className="block relative overflow-hidden aspect-[450/250]">
              {/* Exact 450x250 Kashika Banner Image */}
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Exact Kashika banner-catergory overlay bar at bottom */}
              <div className="absolute bottom-0 inset-x-0 min-h-[35px] sm:min-h-[40px] bg-[rgb(228_25_55_/_88%)] group-hover:bg-[rgb(200_15_42_/_95%)] text-white text-xs sm:text-sm font-bold flex items-center justify-center text-center px-2 py-1 transition-colors duration-200 tracking-wide font-luxury">
                <span>{banner.title}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// C. Exact Kashika Static Trust / Assurance Bar (static-area)
export function TrustFeaturesBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {TRUST_FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3 first:pt-0"
            >
              {/* Exact Kashika 35px PNG icon */}
              <img
                src={item.icon}
                alt={item.title}
                className="w-[35px] h-[35px] object-contain shrink-0"
                loading="lazy"
              />
              <div className="single-static-meta">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// D. Kashika Brand Partners Slider
export function BrandPartnersBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="text-center mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-luxury">
            Authorized Brand Partners
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-2">
          {BRAND_LOGOS.map((logo, idx) => (
            <div key={idx} className="shrink-0 grayscale hover:grayscale-0 transition opacity-80 hover:opacity-100">
              <img
                src={logo}
                alt="Brand Partner"
                className="h-10 sm:h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
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
      <BrandPartnersBar />
    </div>
  );
}
