import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  Percent,
  Star,
  ChevronRight,
  Clock,
  Building2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import HeroBannerSlider from "@/components/storefront/HeroBannerSlider";
import {
  CategoryStoryCircles,
  CategoryBannerGrid,
  TrustFeaturesBar,
  BrandPartnersBar,
} from "@/components/storefront/RetailSections";
import {
  getCachedCategories,
  getCachedHomeProducts,
  getCachedBrands,
  getCachedWeddingPackages,
} from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Concurrently fetch real data with high-performance caching & real-time invalidation
  let categories: any[] = [];
  let products: any[] = [];
  let brands: any[] = [];
  let weddingPackages: any[] = [];

  try {
    const [cats, prods, brnds, pkgs] = await Promise.all([
      getCachedCategories(),
      getCachedHomeProducts(),
      getCachedBrands(),
      getCachedWeddingPackages(),
    ]);
    categories = cats || [];
    products = prods || [];
    brands = brnds || [];
    weddingPackages = pkgs || [];
  } catch (error) {
    console.error("Database query fallback in HomePage:", error);
  }

  // Filter products by PRD sections safely
  const bestDeals = products.filter((p) => (p.discountPercent ?? 0) >= 25);
  const trendingProducts = products.filter((p) => p.isTrending || p.isFeatured);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const electronicsProducts = products.filter((p) => p.category?.slug === "electronics");
  const applianceProducts = products.filter((p) =>
    ["ac-cooling", "refrigeration", "washing-cleaning", "kitchen-appliances"].includes(
      p.category?.slug || ""
    )
  );
  const furnitureProducts = products.filter((p) => p.category?.slug === "furniture");

  return (
    <div className="space-y-8 sm:space-y-12 pb-12">
      {/* 1. KASHIKA-STYLE TOP CATEGORY STORY CIRCLES */}
      <CategoryStoryCircles categories={categories} />

      {/* 2. AUREEVO BRAND-MATCHING HERO CAROUSEL SLIDER */}
      <HeroBannerSlider />

      {/* 3. 2x4 VISUAL CATEGORY BANNER GRID (450x250) */}
      <CategoryBannerGrid categories={categories} />

      {/* 4. BEST DEALS (Countdown + Savings) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-dark via-brand-emerald to-brand-dark rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-brand-gold/30 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gold-gradient text-brand-dark text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm font-luxury">
                  Limited Royal Reserve
                </span>
                <span className="text-xs text-brand-gold-light flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" /> Offer Window: 12h 45m
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 font-luxury">
                Curated High-Value Price Drops
              </h2>
            </div>
            <Link
              href="/deals"
              className="px-5 py-2.5 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark rounded-xl text-xs font-black tracking-wider uppercase font-luxury transition shadow-sm hover:shadow-gold-glow self-start md:self-auto"
            >
              Explore All Deals (30+)
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {bestDeals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-violet tracking-wider uppercase">
              Top Customer Choices
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Trending Right Now
            </h2>
          </div>
          <Link
            href="/category/electronics"
            className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
          >
            View More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. ELECTRONICS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-blue tracking-wider uppercase">
              Cinema At Home
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Televisions & Home Audio
            </h2>
          </div>
          <Link
            href="/category/electronics"
            className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
          >
            Explore All TVs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {electronicsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 9. APPLIANCES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-cyan-600 tracking-wider uppercase">
              Modern Living Comforts
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Major Home Appliances
            </h2>
          </div>
          <Link
            href="/category/ac-cooling"
            className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
          >
            View Appliances <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {applianceProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 10. FURNITURE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              Solid Wood & Living
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Premium Furniture
            </h2>
          </div>
          <Link
            href="/category/furniture"
            className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
          >
            View Furniture <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {furnitureProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 11. WEDDING PACKAGES BUILDER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-dark via-brand-emerald to-brand-dark text-white p-8 sm:p-12 border border-brand-gold/40 shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold-light text-xs font-bold tracking-widest uppercase border border-brand-gold/40 font-luxury">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Royal Home & Wedding Suite Builder
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-luxury">
              Build Your Dream Home Suite
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Curate everything for your royal residence in one tailored package. Choose from our curated ₹1 Lakh, ₹2.5 Lakh, and ₹5 Lakh+ suites covering Smart OLED TVs, Inverter ACs, French Door Fridges, Front Load Washers, and Solid Teakwood King Beds with instant wholesale bundle savings.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {["₹1 Lakh Silver Suite", "₹2.5 Lakh Royal Gold", "₹5 Lakh Imperial Diamond"].map((tier, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-brand-gold-light border border-brand-gold/30"
                >
                  {tier}
                </span>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/wedding-packages"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black text-sm tracking-wider uppercase font-luxury shadow-xl hover:shadow-gold-glow transition"
              >
                CUSTOMIZE YOUR WEDDING SUITE
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FEATURED BRANDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Trusted Brand Alliances
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-8">
          Authorized Direct Brand Partners
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {brands.map((b) => {
            const logoPath = b.logo || `/images/brands/${b.slug}.svg`;
            return (
              <Link
                key={b.id}
                href={`/search?q=${encodeURIComponent(b.name)}`}
                title={`${b.name} - Authorized Brand Partner`}
                className="group p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-gold/60 flex flex-col items-center justify-center min-h-[74px] sm:min-h-[82px] shadow-2xs hover:shadow-md transition-all active:scale-95"
              >
                {logoPath ? (
                  <img
                    src={logoPath}
                    alt={b.name}
                    className="max-h-7 sm:max-h-8 max-w-[88%] w-auto object-contain transition-transform duration-200 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-black text-xs text-slate-700 tracking-wider uppercase">
                    {b.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 15. WHY AUREVO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              The AUREVO Assurance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why Indian Families Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">100% Genuine Brand Warranty</h3>
              <p className="text-xs text-slate-500">
                Direct official brand invoices valid across all service centers nationwide.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-brand-violet flex items-center justify-center mx-auto">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Direct Sourced Margins</h3>
              <p className="text-xs text-slate-500">
                Eliminating middlemen to pass distributor wholesale savings directly to you.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Fast Doorstep Delivery</h3>
              <p className="text-xs text-slate-500">
                Dedicated regional delivery fleet with scheduled delivery and unboxing support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Professional Installation</h3>
              <p className="text-xs text-slate-500">
                Brand-certified technicians for seamless wall mounting, piping, and demo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 16. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Real Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Verified Customer Feedback
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Anand Upadhyay",
              city: "Varanasi, UP",
              rating: 5,
              title: "Exceptional Wedding Package Experience",
              review:
                "We bought the ₹2 Lakh Gold Package for our daughter's marriage. Everything from the Samsung 50' 4K TV to the Whirlpool fridge and Teak Bed arrived in spotless condition within 48 hours. Saved over ₹45,000 compared to local showrooms!",
              product: "Gold Complete Wedding Package",
            },
            {
              name: "Pooja Malhotra",
              city: "New Delhi",
              rating: 5,
              title: "Flawless LG Split AC Installation",
              review:
                "Ordered the LG 1.5T 5 Star AI AC. The unboxing and installation happened simultaneously the next day. The technician was extremely polite and did neat copper piping.",
              product: "LG 1.5 Ton 5 Star Split AC",
            },
            {
              name: "Rajesh K. Jaiswal",
              city: "Gorakhpur, UP",
              rating: 5,
              title: "Best Price on Bosch Washing Machine",
              review:
                "Checked multiple websites and offline stores. AUREVO gave the best price plus instant ₹2,500 festive coupon discount. Authentic invoice with 3-year warranty.",
              product: "Bosch 8 kg Front Load Washer",
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h4 className="font-bold text-sm text-slate-900">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{rev.name}</p>
                  <p className="text-[11px] text-slate-400">{rev.city}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 16.5 KASHIKA TRUST & VALUE ASSURANCE BAR */}
      <TrustFeaturesBar />

      {/* 16.6 KASHIKA BRAND PARTNERS BAR */}
      <BrandPartnersBar />

      {/* 17. B2B / BULK PURCHASE CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark rounded-3xl p-8 sm:p-12 text-white border border-brand-gold/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <span className="bg-brand-gold text-brand-dark text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider font-luxury">
              B2B & Hospitality Procurement
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-luxury">
              Luxury Appliance & Furniture Sourcing for Resorts, Villas & Corporate Offices
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equip premier properties with bulk discounted 4K displays, multi-split HVAC systems, minibar refrigeration, and handcrafted teakwood furnishings. Includes dedicated luxury relationship manager, GST input tax credits, and scheduled deliveries.
            </p>
          </div>

          <Link
            href="/b2b"
            className="px-7 py-3.5 rounded-2xl bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black text-sm tracking-wider uppercase font-luxury transition shrink-0 flex items-center gap-2 shadow-lg hover:shadow-gold-glow"
          >
            <Building2 className="w-4 h-4" />
            SUBMIT CORPORATE ENQUIRY
          </Link>
        </div>
      </section>

      {/* 18. NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-emerald rounded-3xl p-8 sm:p-12 text-white text-center max-w-3xl mx-auto border border-brand-gold/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black font-luxury">
            Enter The World of Luxury
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
            Subscribe to our private circular for exclusive preview access to new collections and an instant ₹1,000 royal privilege voucher.
          </p>

          <form className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your private email address"
              className="flex-1 px-4 py-3 rounded-xl text-brand-text text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold border border-brand-gold/40"
            />
            <button
              type="button"
              className="px-6 py-3 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black text-xs uppercase tracking-wider font-luxury rounded-xl transition shadow-md hover:shadow-gold-glow"
            >
              Claim Voucher
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
