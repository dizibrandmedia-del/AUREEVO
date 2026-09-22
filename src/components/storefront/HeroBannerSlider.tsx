"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

// AUREEVO Luxury Brand Matching Hero Banners (Emerald Green & Royal Gold Aesthetic)
const SLIDER_BANNERS = [
  {
    id: 1,
    image: "/images/banners/slider-1.jpg",
    alt: "AUREEVO The Art of Luxury Living - Premium Appliances Festival",
    badge: "Festive Collection",
    title: "The Art of Luxury Living",
    subtitle: "Premium Refrigeration, Washing & Inverter AC Series",
    href: "/category/electronics",
  },
  {
    id: 2,
    image: "/images/banners/slider-2.jpg",
    alt: "AUREEVO Ultra HD 4K OLED & Dolby Atmos Soundbars",
    badge: "Cinematic Luxury",
    title: "Elevate Your Entertainment",
    subtitle: "Ultra HD 4K OLED & Cinematic Dolby Atmos Soundbars",
    href: "/category/electronics?sub=led-smart-tvs",
  },
  {
    id: 3,
    image: "/images/banners/slider-3.jpg",
    alt: "AUREEVO 5-Star Smart Inverter Air Conditioners",
    badge: "5-Star Energy Saver",
    title: "Summer Bliss Inverter ACs",
    subtitle: "Whisper-Quiet Tropical Inverter Cooling with White-Glove Installation",
    href: "/category/ac-cooling",
  },
  {
    id: 4,
    image: "/images/banners/slider-4.jpg",
    alt: "AUREEVO Royal Wedding Collection - Complete Home Electronic Suites",
    badge: "Royal Privilege",
    title: "Royal Wedding Suites",
    subtitle: "All-in-One Curated Living: 4K OLED TV, French Door Fridge, Bed & Washer",
    href: "/wedding-packages",
  },
  {
    id: 5,
    image: "/images/banners/slider-5.jpg",
    alt: "AUREEVO Chef-Grade Modular Kitchen Luxury",
    badge: "Chef Edition",
    title: "Chef-Grade Kitchen Luxury",
    subtitle: "Smart Glass Touch Chimneys, 4-Burner Hobs & Built-in Convection Ovens",
    href: "/category/kitchen-appliances",
  },
];

export default function HeroBannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDER_BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDER_BANNERS.length) % SLIDER_BANNERS.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  return (
    <div
      className="relative w-full overflow-hidden bg-brand-dark group shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Container with exact responsive aspect ratios */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/9] lg:aspect-[21/9]">
        {SLIDER_BANNERS.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Link href={banner.href} className="block w-full h-full relative">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Subtle luxury brand gradient scrim on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent to-transparent pointer-events-none" />
              </Link>
            </div>
          );
        })}

        {/* Previous Navigation Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            prevSlide();
          }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-brand-dark/70 hover:bg-brand-emerald text-brand-gold-light border border-brand-gold/30 flex items-center justify-center backdrop-blur-sm transition shadow-lg opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Next Navigation Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            nextSlide();
          }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-brand-dark/70 hover:bg-brand-emerald text-brand-gold-light border border-brand-gold/30 flex items-center justify-center backdrop-blur-sm transition shadow-lg opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dots / Indicators */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {SLIDER_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-brand-gold shadow-md"
                  : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
