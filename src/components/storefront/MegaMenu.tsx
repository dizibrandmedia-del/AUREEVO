"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Tv,
  Wind,
  Refrigerator,
  Sparkles,
  UtensilsCrossed,
  Laptop,
  Smartphone,
  Armchair,
  Home,
  Tag,
  ChevronDown,
  Flame,
  Droplets,
} from "lucide-react";

interface SubItem {
  name: string;
  href: string;
}

interface Column {
  title: string;
  items: SubItem[];
}

export interface MenuCategory {
  name: string;
  slug: string;
  icon: any;
  highlight?: boolean;
  columns?: Column[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: Tv,
    columns: [
      {
        title: "Televisions",
        items: [
          { name: "LED & Smart TVs", href: "/category/electronics?sub=led-smart-tvs" },
          { name: "QLED & OLED 4K TVs", href: "/category/electronics?sub=qled-oled-tvs" },
          { name: "Large Screen (55\" & Above)", href: "/category/electronics?size=55" },
          { name: "Budget 32\" - 43\" Smart TVs", href: "/category/electronics?size=32" },
        ],
      },
      {
        title: "Audio & Entertainment",
        items: [
          { name: "Soundbars with Subwoofer", href: "/category/electronics?sub=soundbars-home-theatre" },
          { name: "Home Theatre Systems", href: "/category/electronics?sub=soundbars-home-theatre" },
          { name: "Party Speakers & Bluetooth", href: "/category/electronics?sub=speakers-audio" },
          { name: "Headphones & True Wireless", href: "/category/electronics?sub=speakers-audio" },
        ],
      },
      {
        title: "Top Brands",
        items: [
          { name: "Sony Bravia", href: "/category/electronics?brand=sony" },
          { name: "Samsung Crystal UHD", href: "/category/electronics?brand=samsung" },
          { name: "LG OLED / NanoCell", href: "/category/electronics?brand=lg" },
        ],
      },
    ],
  },
  {
    name: "AC & Cooling",
    slug: "ac-cooling",
    icon: Wind,
    columns: [
      {
        title: "Air Conditioners",
        items: [
          { name: "1.5 Ton Split Inverter ACs", href: "/category/ac-cooling?sub=split-inverter-acs" },
          { name: "1.0 Ton Bedroom ACs", href: "/category/ac-cooling?sub=split-inverter-acs" },
          { name: "2.0 Ton Large Hall ACs", href: "/category/ac-cooling?sub=split-inverter-acs" },
          { name: "Window ACs", href: "/category/ac-cooling?sub=window-acs" },
          { name: "5 Star Energy Savers", href: "/category/ac-cooling?star=5" },
        ],
      },
      {
        title: "Coolers & Ventilation",
        items: [
          { name: "Desert Air Coolers", href: "/category/ac-cooling?sub=air-coolers-fans" },
          { name: "Tower Air Coolers", href: "/category/ac-cooling?sub=air-coolers-fans" },
          { name: "High Speed Ceiling Fans", href: "/category/ac-cooling?sub=air-coolers-fans" },
          { name: "BLDC Energy Saving Fans", href: "/category/ac-cooling?sub=air-coolers-fans" },
        ],
      },
      {
        title: "Leading Brands",
        items: [
          { name: "LG Dual Inverter", href: "/category/ac-cooling?brand=lg" },
          { name: "Voltas Maha Inverter", href: "/category/ac-cooling?brand=voltas" },
          { name: "Samsung WindFree", href: "/category/ac-cooling?brand=samsung" },
        ],
      },
    ],
  },
  {
    name: "Refrigeration",
    slug: "refrigeration",
    icon: Refrigerator,
    columns: [
      {
        title: "By Type",
        items: [
          { name: "Double Door Frost-Free", href: "/category/refrigeration?sub=double-door-refrigerators" },
          { name: "Side by Side Luxury", href: "/category/refrigeration?sub=side-by-side-refrigerators" },
          { name: "Single Door Direct Cool", href: "/category/refrigeration?sub=single-door-refrigerators" },
          { name: "Convertible 5-in-1", href: "/category/refrigeration?feature=convertible" },
        ],
      },
      {
        title: "Commercial & Deep Freezers",
        items: [
          { name: "Deep Freezers & Coolers", href: "/category/refrigeration?type=deep-freezer" },
          { name: "Mini Bars & Beverage Fridges", href: "/category/refrigeration?type=mini" },
        ],
      },
      {
        title: "Popular Brands",
        items: [
          { name: "Whirlpool IntelliFresh", href: "/category/refrigeration?brand=whirlpool" },
          { name: "Samsung Digital Inverter", href: "/category/refrigeration?brand=samsung" },
          { name: "Godrej Edge Pro", href: "/category/refrigeration?brand=godrej" },
        ],
      },
    ],
  },
  {
    name: "Washing & Cleaning",
    slug: "washing-cleaning",
    icon: Sparkles,
    columns: [
      {
        title: "Washing Machines",
        items: [
          { name: "Front Load Fully Automatic", href: "/category/washing-cleaning?sub=front-load-washing-machines" },
          { name: "Top Load Fully Automatic", href: "/category/washing-cleaning?sub=top-load-washing-machines" },
          { name: "Semi-Automatic Tough Washers", href: "/category/washing-cleaning?sub=semi-automatic-washers" },
          { name: "Washer Dryers (Combos)", href: "/category/washing-cleaning?sub=front-load-washing-machines" },
        ],
      },
      {
        title: "Cleaning Equipment",
        items: [
          { name: "Dry & Wet Vacuum Cleaners", href: "/category/washing-cleaning?sub=vacuum-cleaners" },
          { name: "Robot Vacuum Cleaners", href: "/category/washing-cleaning?sub=vacuum-cleaners" },
        ],
      },
      {
        title: "Top Brands",
        items: [
          { name: "Bosch German Engineering", href: "/category/washing-cleaning?brand=bosch" },
          { name: "LG Direct Drive", href: "/category/washing-cleaning?brand=lg" },
          { name: "Whirlpool Stainwash", href: "/category/washing-cleaning?brand=whirlpool" },
        ],
      },
    ],
  },
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    icon: UtensilsCrossed,
    columns: [
      {
        title: "Cooking & Heating",
        items: [
          { name: "Convection Microwave & OTG", href: "/category/kitchen-appliances?sub=microwave-otg" },
          { name: "Air Fryers & Halogen Ovens", href: "/category/kitchen-appliances?sub=air-fryers-kettles" },
          { name: "Induction Cooktops & Hobs", href: "/category/kitchen-appliances?sub=chimneys-cooktops" },
          { name: "Auto-Clean Chimneys", href: "/category/kitchen-appliances?sub=chimneys-cooktops" },
        ],
      },
      {
        title: "Food Preparation",
        items: [
          { name: "Heavy Duty Mixer Grinders", href: "/category/kitchen-appliances?sub=mixer-grinders-juicers" },
          { name: "Juicers & Food Processors", href: "/category/kitchen-appliances?sub=mixer-grinders-juicers" },
          { name: "Electric Kettles & Toasters", href: "/category/kitchen-appliances?sub=air-fryers-kettles" },
        ],
      },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: Armchair,
    columns: [
      {
        title: "Bedroom Furniture",
        items: [
          { name: "Hydraulic Storage Beds", href: "/category/furniture?sub=beds" },
          { name: "Solid Teak & Sheesham Beds", href: "/category/furniture?sub=beds" },
          { name: "Wardrobes & Dressing Tables", href: "/category/furniture?sub=wardrobes-storage" },
          { name: "Orthopedic Mattresses", href: "/category/furniture?sub=beds" },
        ],
      },
      {
        title: "Living & Dining",
        items: [
          { name: "L-Shape & Fabric Sofas", href: "/category/furniture?sub=sofas-recliners" },
          { name: "Motorized Recliners", href: "/category/furniture?sub=sofas-recliners" },
          { name: "6-Seater Solid Dining Sets", href: "/category/furniture?sub=dining-tables" },
          { name: "Coffee Tables & TV Units", href: "/category/furniture?sub=dining-tables" },
        ],
      },
    ],
  },
  {
    name: "Wedding Packages",
    slug: "wedding-packages",
    icon: Sparkles,
    highlight: true,
    columns: [
      {
        title: "Choose by Budget",
        items: [
          { name: "Silver Package (₹1 Lakh)", href: "/wedding-packages?tier=1_LAKH" },
          { name: "Gold Complete Package (₹2 Lakh)", href: "/wedding-packages?tier=2_LAKH" },
          { name: "Platinum Suite (₹3 Lakh)", href: "/wedding-packages?tier=3_LAKH" },
          { name: "Diamond Grand (₹5 Lakh)", href: "/wedding-packages?tier=5_LAKH" },
          { name: "Royal Emperor (₹10 Lakh+)", href: "/wedding-packages?tier=10_LAKH_PLUS" },
        ],
      },
      {
        title: "Package Features",
        items: [
          { name: "Custom Home Bundles", href: "/wedding-packages" },
          { name: "Save up to 35% on Combo", href: "/wedding-packages" },
          { name: "Free Delivery & Assembly", href: "/wedding-packages" },
          { name: "Official Sales Quotation PDF", href: "/wedding-packages" },
        ],
      },
    ],
  },
  {
    name: "Festive Deals",
    slug: "deals",
    icon: Flame,
    highlight: true,
  },
];

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(null);

  return (
    <nav className="hidden lg:block border-t border-brand-gold/15 bg-brand-dark relative shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-between gap-1 py-1.5 text-xs font-semibold text-slate-200">
          {MENU_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isHighlight = cat.highlight;

            return (
              <li
                key={cat.slug}
                onMouseEnter={() => cat.columns && setActiveCategory(cat)}
                onMouseLeave={() => setActiveCategory(null)}
                className="relative py-1.5"
              >
                <Link
                  href={cat.slug === "deals" ? "/deals" : cat.slug === "wedding-packages" ? "/wedding-packages" : `/category/${cat.slug}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                    isHighlight
                      ? "text-brand-gold-light bg-brand-gold/15 hover:bg-brand-gold/25 font-bold border border-brand-gold/40 shadow-sm"
                      : "hover:text-brand-gold-light hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isHighlight ? "text-brand-gold" : "text-brand-gold/80"}`} />
                  <span>{cat.name}</span>
                  {cat.columns && <ChevronDown className="w-3 h-3 text-slate-400" />}
                </Link>

                {/* Dropdown Mega Menu Flyout */}
                {activeCategory?.slug === cat.slug && cat.columns && (
                  <div
                    className="absolute left-0 top-full mt-0 w-[720px] bg-brand-emerald text-white rounded-2xl shadow-dropdown border border-brand-gold/30 p-7 grid grid-cols-3 gap-6 z-50 animate-fadeIn"
                    onMouseEnter={() => setActiveCategory(cat)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    {cat.columns.map((col, idx) => (
                      <div key={idx} className="space-y-3">
                        <h4 className="font-luxury font-bold text-xs uppercase tracking-widest text-brand-gold-light border-b border-brand-gold/25 pb-2">
                          {col.title}
                        </h4>
                        <ul className="space-y-2">
                          {col.items.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <Link
                                href={item.href}
                                className="text-slate-300 hover:text-brand-gold-light text-xs block py-0.5 transition font-medium hover:translate-x-1"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
