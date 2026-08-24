import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { ProductCard } from '@/components/customer/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Quote,
  Instagram,
  CheckCircle2,
  Layers,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0; // Dynamic on request

export default async function HomePage() {
  const [sections, banners, categories, products, reviews, brands] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.category.findMany({
      where: { status: 'ACTIVE', parentId: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        variants: { where: { status: 'ACTIVE' } },
        inventories: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    }),
    prisma.customerReview.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: { firstName: true, lastName: true } },
        product: { select: { name: true, slug: true } },
      },
      take: 3,
    }),
    prisma.brand.findMany({
      where: { status: 'ACTIVE' },
      take: 4,
    }),
  ]);

  const heroBanner = banners[0] || {
    title: 'THE WORLD OF LUXURY.',
    subtitle: 'Rare 24K Swiss Gold Botanical Alchemy & Haute Parfumerie.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=85',
    ctaText: 'EXPLORE THE HAUTE COLLECTION',
    ctaUrl: '/shop',
  };

  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(2, 6);
  const signatureProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* 1. HERO BANNER SECTION */}
      <section className="relative min-h-[480px] sm:min-h-[600px] lg:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-luxury-border/60 w-full">
        {/* Background Image with Luxury Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner.image}
            alt={heroBanner.title}
            className="w-full h-full object-cover object-center scale-105 animate-fade-in filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-darkest via-luxury-darkest/60 to-luxury-darkest/40" />
          <div className="absolute inset-0 bg-radial-gradient opacity-50" />
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-4 sm:space-y-6 w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-luxury-emerald/90 border border-luxury-gold/50 text-[11px] sm:text-xs text-luxury-gold-light shadow-2xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
            <span className="font-semibold tracking-wider uppercase">Official Haute Maison</span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-bold font-brand text-white tracking-wide leading-[1.15] drop-shadow-2xl">
            {heroBanner.title.includes('LUXURY') ? (
              <>
                THE WORLD OF <span className="gold-text-gradient">LUXURY.</span>
              </>
            ) : (
              heroBanner.title
            )}
          </h1>

          <p className="text-xs sm:text-base lg:text-lg text-luxury-muted max-w-2xl mx-auto leading-relaxed drop-shadow px-2">
            {heroBanner.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-6 w-full max-w-md mx-auto">
            <Link href={heroBanner.ctaUrl || '/shop'} className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto justify-center text-xs sm:text-sm py-3 px-5 sm:px-6"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {heroBanner.ctaText || 'EXPLORE COLLECTION'}
              </Button>
            </Link>
            <Link href="/category/fragrance" className="w-full sm:w-auto">
              <Button
                variant="emerald"
                size="lg"
                className="w-full sm:w-auto justify-center text-xs sm:text-sm py-3 px-5 sm:px-6"
              >
                HAUTE PARFUMERIE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY SHOWCASE */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-luxury-border/80 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
              Artisanal Domains
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-brand text-white mt-1">
              Curated Maisons
            </h2>
          </div>
          <Link href="/shop" className="text-xs text-luxury-gold-light hover:underline font-semibold flex items-center gap-1">
            <span>Explore All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden bg-luxury-card border border-luxury-border hover:border-luxury-gold/60 transition-all duration-500 shadow-xl"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-darkest via-luxury-darkest/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-luxury-gold-light">
                    {cat.children?.length || 0} Sub-collections
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-brand text-white group-hover:text-luxury-gold-light transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-luxury-muted line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS & ICONIC MASTERPIECES */}
      <section className="py-12 sm:py-20 bg-luxury-card/30 border-y border-luxury-border/60 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-luxury-border/80 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
                Most Coveted
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-brand text-white mt-1">
                Iconic Formulations
              </h2>
            </div>
            <Link href="/shop?sort=bestseller" className="text-xs text-luxury-gold-light hover:underline font-semibold flex items-center gap-1">
              <span>View All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SPOTLIGHT FEATURED COLLECTION */}
      {signatureProducts.length > 0 && (
        <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl bg-gradient-to-br from-luxury-emerald via-luxury-card to-luxury-darkest border border-luxury-gold/40 p-5 sm:p-8 lg:p-12 overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-96 h-96 bg-radial-gradient opacity-30 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-darkest/80 border border-luxury-gold/40 text-xs text-luxury-gold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Signature Maison Highlight</span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-brand text-white leading-tight">
                  {signatureProducts[0].name}
                </h2>

                <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-lg">
                  {signatureProducts[0].shortDescription ||
                    'Mastercrafted with rare Swiss colloidal gold flakes, royal Kashmiri saffron, and cellular peptides.'}
                </p>

                <div className="flex items-baseline gap-4">
                  <span className="text-2xl sm:text-3xl font-bold font-brand text-white">
                    ₹{signatureProducts[0].sellingPrice.toLocaleString('en-IN')}
                  </span>
                  {signatureProducts[0].mrp > signatureProducts[0].sellingPrice && (
                    <span className="text-sm text-luxury-muted line-through">
                      ₹{signatureProducts[0].mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2">
                  <Link href={`/product/${signatureProducts[0].slug}`} className="w-full sm:w-auto">
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full sm:w-auto justify-center"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Experience Formulation
                    </Button>
                  </Link>
                  <Link href="/category/skincare" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                      Explore Skincare Range
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="aspect-[4/3] rounded-2xl bg-luxury-surface/40 border border-luxury-gold/30 overflow-hidden shadow-2xl flex items-center justify-center p-3 sm:p-4">
                <img
                  src={
                    (signatureProducts[0].images ? JSON.parse(signatureProducts[0].images)[0] : null) ||
                    '/images/aureevo-logo.png'
                  }
                  alt={signatureProducts[0].name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. NEW ARRIVALS & RELEASES */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-luxury-border/80 pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
              Fresh Harvests
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-brand text-white mt-1">
              New High-Potency Launches
            </h2>
          </div>
          <Link href="/shop?sort=newest" className="text-xs text-luxury-gold-light hover:underline font-semibold flex items-center gap-1">
            <span>Explore All New Releases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. CLIENTÈLE PRAISE & VERIFIED REVIEWS */}
      {reviews.length > 0 && (
        <section className="py-12 sm:py-20 bg-luxury-emerald/15 border-t border-luxury-border/60 px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
                Distinguished Feedback
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-brand text-white">
                Clientèle Praise
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-3xl bg-luxury-card/90 border border-luxury-border p-5 sm:p-8 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-luxury-gold">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-luxury-gold text-luxury-gold" />
                      ))}
                    </div>
                    {rev.title && (
                      <h4 className="text-sm font-bold font-brand text-white">{rev.title}</h4>
                    )}
                    <p className="text-xs text-luxury-muted leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">
                        {rev.user.firstName} {rev.user.lastName}
                      </span>
                      <span className="text-[10px] text-luxury-gold-light">Verified Clientèle</span>
                    </div>
                    <Link
                      href={`/product/${rev.product.slug}`}
                      className="text-[10px] text-luxury-muted hover:text-white font-mono"
                    >
                      {rev.product.name.slice(0, 20)}...
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. INSTAGRAM UGC SHOWCASE */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
            <Instagram className="w-4 h-4" />
            <span>@AUREEVO.LUXURY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-brand text-white">
            The Haute World of AUREEVO
          </h2>
          <p className="text-xs text-luxury-muted max-w-md mx-auto px-2">
            Tag #AUREEVOLuxury to be spotlighted in our private salon journal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
          ].map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-luxury-card border border-luxury-border"
            >
              <img src={img} alt="Instagram UGC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Instagram className="w-6 h-6 text-luxury-gold" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
