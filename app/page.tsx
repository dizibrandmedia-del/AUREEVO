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
import { parseProductImages } from '@/lib/utils';

export const revalidate = 0; // Dynamic on request

const FALLBACK_BANNERS = [
  {
    title: 'THE WORLD OF LUXURY.',
    subtitle: 'Rare 24K Swiss Gold Botanical Alchemy & Haute Parfumerie.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=85',
    ctaText: 'EXPLORE THE HAUTE COLLECTION',
    ctaUrl: '/shop',
  },
];

const FALLBACK_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Haute Parfumerie',
    slug: 'fragrance',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'Bespoke extraits de parfum distilled from Grasse rose and aged oud.',
    children: [{ id: 'sub-1', name: 'Pure Parfums' }, { id: 'sub-2', name: 'Artisanal Extraits' }],
  },
  {
    id: 'cat-2',
    name: 'Cellular Skincare',
    slug: 'skincare',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    description: 'Rare Swiss 24K colloidal gold & royal saffron cellular formulations.',
    children: [{ id: 'sub-3', name: 'Face Elixirs' }, { id: 'sub-4', name: 'Gold Serums' }],
  },
  {
    id: 'cat-3',
    name: 'Artisanal Jewels',
    slug: 'jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted luxury pieces set in 18K solid gold and gemstones.',
    children: [{ id: 'sub-5', name: 'Fine Necklaces' }, { id: 'sub-6', name: 'Statement Rings' }],
  },
  {
    id: 'cat-4',
    name: 'Maison Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    description: 'Fine Italian leather craftsmanship and bespoke silk creations.',
    children: [{ id: 'sub-7', name: 'Silk Scarves' }, { id: 'sub-8', name: 'Leather Goods' }],
  },
];

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    name: '24K Swiss Gold Cellular Nectar',
    slug: '24k-swiss-gold-cellular-nectar',
    brand: { name: 'AUREEVO LAB' },
    category: { name: 'Cellular Skincare' },
    sellingPrice: 18500,
    mrp: 24000,
    images: JSON.stringify(['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80']),
    rating: 5.0,
    reviewCount: 42,
    isFeatured: true,
    shortDescription: 'Infused with colloidal 24K Swiss gold flakes and Kashmiri saffron for radiant rejuvenation.',
    inventories: [{ currentStock: 15 }],
    variants: [],
  },
  {
    id: 'prod-2',
    name: 'Oud Royale Extrait de Parfum',
    slug: 'oud-royale-extrait-de-parfum',
    brand: { name: 'MAISON AUREEVO' },
    category: { name: 'Haute Parfumerie' },
    sellingPrice: 22000,
    mrp: 28000,
    images: JSON.stringify(['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80']),
    rating: 4.9,
    reviewCount: 29,
    isFeatured: true,
    shortDescription: 'A rare formulation of 50-year aged Cambodian agarwood, Damascus rose, and ambergris.',
    inventories: [{ currentStock: 8 }],
    variants: [],
  },
  {
    id: 'prod-3',
    name: 'Imperial Saffron Night Crème',
    slug: 'imperial-saffron-night-creme',
    brand: { name: 'AUREEVO BOTANIQUE' },
    category: { name: 'Cellular Skincare' },
    sellingPrice: 14500,
    mrp: 19000,
    images: JSON.stringify(['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80']),
    rating: 5.0,
    reviewCount: 37,
    isFeatured: false,
    shortDescription: 'Deep nocturnal regenerative treatment enriched with triple hyaluronic peptides.',
    inventories: [{ currentStock: 20 }],
    variants: [],
  },
  {
    id: 'prod-4',
    name: 'Diamond Encrusted Solitaire Pendant',
    slug: 'diamond-encrusted-solitaire-pendant',
    brand: { name: 'AUREEVO JOAILLERIE' },
    category: { name: 'Artisanal Jewels' },
    sellingPrice: 65000,
    mrp: 80000,
    images: JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']),
    rating: 5.0,
    reviewCount: 16,
    isFeatured: true,
    shortDescription: 'VVS clarity natural diamond set in handcrafted 18K solid yellow gold.',
    inventories: [{ currentStock: 5 }],
    variants: [],
  },
];

export default async function HomePage() {
  let banners: any[] = [];
  let categories: any[] = [];
  let products: any[] = [];
  let reviews: any[] = [];

  try {
    const [fetchedBanners, fetchedCategories, fetchedProducts, fetchedReviews] = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }).catch(() => []),
      prisma.category.findMany({
        where: { status: 'ACTIVE', parentId: null },
        include: {
          children: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }).catch(() => []),
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
      }).catch(() => []),
      prisma.customerReview.findMany({
        where: { status: 'APPROVED' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          product: { select: { name: true, slug: true } },
        },
        take: 3,
      }).catch(() => []),
    ]);

    banners = fetchedBanners || [];
    categories = fetchedCategories || [];
    products = fetchedProducts || [];
    reviews = fetchedReviews || [];
  } catch (err) {
    console.error('HomePage database query fallback:', err);
  }

  const heroBanner = banners[0] || FALLBACK_BANNERS[0];
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;

  const bestSellers = displayProducts.slice(0, 4);
  const newArrivals = displayProducts.slice(1, 5);
  const signatureProducts = displayProducts.filter((p) => p.isFeatured);
  const spotlightProduct = signatureProducts[0] || displayProducts[0];

  const spotlightImage = spotlightProduct
    ? parseProductImages(spotlightProduct.images)[0]
    : '/images/aureevo-logo.png';

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
          {displayCategories.map((cat) => (
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
      {spotlightProduct && (
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
                  {spotlightProduct.name}
                </h2>

                <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-lg">
                  {spotlightProduct.shortDescription ||
                    'Mastercrafted with rare Swiss colloidal gold flakes, royal Kashmiri saffron, and cellular peptides.'}
                </p>

                <div className="flex items-baseline gap-4">
                  <span className="text-2xl sm:text-3xl font-bold font-brand text-white">
                    ₹{(spotlightProduct.sellingPrice || 18500).toLocaleString('en-IN')}
                  </span>
                  {spotlightProduct.mrp > spotlightProduct.sellingPrice && (
                    <span className="text-sm text-luxury-muted line-through">
                      ₹{spotlightProduct.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2">
                  <Link href={`/product/${spotlightProduct.slug}`} className="w-full sm:w-auto">
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
                  src={spotlightImage}
                  alt={spotlightProduct.name}
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
                      {[...Array(rev.rating || 5)].map((_, i) => (
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
                        {rev.user?.firstName || 'Distinguished'} {rev.user?.lastName || 'Patron'}
                      </span>
                      <span className="text-[10px] text-luxury-gold-light">Verified Clientèle</span>
                    </div>
                    {rev.product?.slug && (
                      <Link
                        href={`/product/${rev.product.slug}`}
                        className="text-[10px] text-luxury-muted hover:text-white font-mono"
                      >
                        {rev.product.name.slice(0, 20)}...
                      </Link>
                    )}
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
