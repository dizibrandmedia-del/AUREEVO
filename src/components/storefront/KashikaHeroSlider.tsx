"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Exact Kashika Banner Slider Images
const SLIDER_BANNERS = [
  {
    id: 1,
    image: "/images/kashika/slider-1.jpg",
    alt: "Kashika Electronics Festive Deals",
    href: "/deals",
  },
  {
    id: 2,
    image: "/images/kashika/slider-2.jpg",
    alt: "Electronics Mega Offer & Smart 4K TVs",
    href: "/category/electronics",
  },
  {
    id: 3,
    image: "/images/kashika/slider-3.jpg",
    alt: "Summer Inverter ACs and Cooling",
    href: "/category/ac-cooling",
  },
  {
    id: 4,
    image: "/images/kashika/slider-4.jpg",
    alt: "Home & Kitchen Appliances Festival",
    href: "/category/kitchen-appliances",
  },
  {
    id: 5,
    image: "/images/kashika/slider-5.png",
    alt: "Special Discounts & Wedding Electronics",
    href: "/wedding-packages",
  },
];

export default function KashikaHeroSlider() {
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
    }, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-900 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Container with exact responsive aspect ratios */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[1568/530]">
        {SLIDER_BANNERS.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Link href={banner.href} className="block w-full h-full">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
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
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
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
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
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
                  ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-brand-gold shadow-xs"
                  : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
