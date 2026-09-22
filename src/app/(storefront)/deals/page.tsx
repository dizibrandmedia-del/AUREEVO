import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import { Flame, Sparkles, Percent, Tag, ShieldCheck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  let products: any[] = [];
  try {
    products = await db.product.findMany({
      where: {
        status: "PUBLISHED",
        discountPercent: { gte: 15 },
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
      },
      orderBy: { discountPercent: "desc" },
      take: 40,
    });
  } catch (err) {
    console.error("Failed to load deals:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-brand-dark">Festive Deals</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-dark text-white p-6 sm:p-12 border border-brand-gold/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            Limited Festive Window
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-luxury tracking-wide text-brand-gold-light">
            Luxury Festive Deals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Exclusive royal discounts up to 55% OFF across flagship 4K OLED TVs, Inverter ACs, French Door Fridges, and Solid Wood Living Sets with zero delivery charges and white-glove installation.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8 space-y-4">
          <Sparkles className="w-12 h-12 text-brand-gold mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Fresh Deals Being Curated</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Check back shortly or explore our full luxury product catalogue.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-emerald text-brand-gold-light rounded-xl text-xs font-bold font-luxury tracking-wider uppercase"
          >
            Explore All Products
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-black text-brand-dark flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-500" />
              Highest Discount Products ({products.length})
            </h2>
            <span className="text-xs text-slate-500">Sorted by Maximum Savings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
