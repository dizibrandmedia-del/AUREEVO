'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { ProductCard } from '@/components/customer/ProductCard';
import { useCart } from '@/components/customer/CartContext';
import { useWishlist } from '@/components/customer/WishlistContext';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  MapPin,
  FileVideo,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

import { Analytics } from '@/lib/analytics';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gallery & Variant State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'narrative' | 'specs' | 'ingredients' | 'how_to_use' | 'reviews'>('narrative');

  // Pincode Estimator State
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<null | {
    valid: boolean;
    city: string;
    timeline: string;
    freeShipping: boolean;
  }>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data.product);
          setRelatedProducts(data.data.relatedProducts || []);
          if (data.data.product.variants && data.data.product.variants.length > 0) {
            setSelectedVariant(data.data.product.variants[0]);
          }

          // Fire Analytics View Content
          Analytics.viewItem({
            id: data.data.product.id,
            name: data.data.product.name,
            brand: data.data.product.brand?.name || 'AUREEVO',
            category: data.data.product.category?.name || 'Luxury',
            price: data.data.product.sellingPrice,
            quantity: 1,
          });

          // Record view in background
          fetch('/api/recently-viewed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: data.data.product.id }),
          }).catch(() => {});
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 w-full space-y-8">
          <Skeleton className="h-6 w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
          <h2 className="text-2xl font-bold font-brand text-white">Formulation Not Found</h2>
          <p className="text-xs text-luxury-muted">
            The requested luxury creation is either archived or unavailable.
          </p>
          <Link href="/shop">
            <Button variant="gold" size="sm">
              Return to Haute Catalogue
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const primaryImage = images[selectedImageIndex] || '/images/aureevo-logo.png';
  const inWishlist = isInWishlist(product.id, selectedVariant?.id);

  const currentPrice = selectedVariant ? selectedVariant.price : product.sellingPrice;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.inventories?.[0]?.currentStock || 10;
  const isOutOfStock = currentStock <= 0;

  const highlights = product.highlights ? JSON.parse(product.highlights) : [];
  const specifications = product.specifications ? JSON.parse(product.specifications) : {};

  const handleAddToCart = async () => {
    const ok = await addToCart(product.id, selectedVariant?.id || null, quantity);
    if (ok) {
      Analytics.addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand?.name || 'AUREEVO',
        price: currentPrice,
        quantity,
      });
    }
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, selectedVariant?.id || null, quantity);
    if (success) {
      Analytics.addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand?.name || 'AUREEVO',
        price: currentPrice,
        quantity,
      });
      router.push('/cart');
    }
  };

  const productSchema = getProductSchema(product, product.reviews || []);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: product.category?.name || 'Shop', url: `/category/${product.category?.slug || 'all'}` },
    { name: product.name, url: `/product/${product.slug}` },
  ]);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setPincodeStatus({ valid: false, city: '', timeline: '', freeShipping: false });
      return;
    }

    // Dynamic Indian Pincode Estimator
    const isMetro = ['400', '110', '560', '700', '600', '500'].some((prefix) =>
      pincode.startsWith(prefix)
    );
    setPincodeStatus({
      valid: true,
      city: isMetro ? 'Metro Capital Hub' : 'Standard Delivery Zone',
      timeline: isMetro ? 'Next-Day Express Dispatch (24–36 hrs)' : 'White-Glove Courier (2–4 Days)',
      freeShipping: currentPrice * quantity >= 5000,
    });
  };

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />

      {/* Breadcrumbs Navigation */}
      <nav className="bg-luxury-card/20 border-b border-luxury-border/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-luxury-muted flex-wrap">
          <Link href="/" className="hover:text-luxury-gold">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-luxury-gold">
            Maison Catalogue
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/category/${product.category.slug}`} className="hover:text-luxury-gold">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-luxury-gold-light truncate max-w-xs">{product.name}</span>
        </div>
      </nav>

      {/* Main PDP Section */}
      <section className="py-6 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* LEFT: MULTI-IMAGE & VIDEO GALLERY */}
          <div className="space-y-4 lg:sticky lg:top-28">
            {/* Primary Main Showcase */}
            <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl bg-luxury-surface/50 border border-luxury-border overflow-hidden relative flex items-center justify-center p-3 sm:p-4 shadow-2xl">
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl transition-all duration-500"
              />

              {product.isFeatured && (
                <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-luxury-gold text-luxury-darkest text-[10px] font-bold uppercase tracking-wider shadow-lg">
                  Signature Edition
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id, selectedVariant?.id)}
                className={`absolute top-6 right-6 p-3 rounded-2xl border backdrop-blur-md transition-transform hover:scale-110 shadow-lg ${
                  inWishlist
                    ? 'bg-luxury-gold border-luxury-gold text-luxury-darkest'
                    : 'bg-luxury-darkest/80 border-luxury-border text-luxury-muted hover:text-white'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl border overflow-hidden shrink-0 transition-all p-1 bg-luxury-surface/40 ${
                      selectedImageIndex === idx
                        ? 'border-luxury-gold ring-2 ring-luxury-gold/30'
                        : 'border-luxury-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT DETAILS, VARIANTS & CTAS */}
          <div className="space-y-6">
            {/* Brand & Reviews Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold text-luxury-gold-light">
                  {product.brand?.name || 'AUREEVO Maison'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-luxury-gold bg-luxury-emerald/40 px-3 py-1 rounded-full border border-luxury-gold/30">
                  <Star className="w-3.5 h-3.5 fill-luxury-gold text-luxury-gold" />
                  <span className="font-bold">{product.rating || 5.0}</span>
                  <span className="text-luxury-muted text-[10px]">
                    ({product.reviews?.length || product.reviewCount || 1} Patrons)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold font-brand text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 text-xs text-luxury-muted font-mono">
                <span>SKU: {currentSku}</span>
                <span>•</span>
                <span>Category: {product.category?.name}</span>
              </div>
            </div>

            {/* Short Narrative */}
            {product.shortDescription && (
              <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Pricing Section */}
            <div className="p-5 rounded-2xl bg-luxury-card/70 border border-luxury-border space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-bold font-brand text-white">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {currentMrp > currentPrice && (
                  <>
                    <span className="text-base text-luxury-muted line-through">
                      ₹{currentMrp.toLocaleString('en-IN')}
                    </span>
                    <Badge variant="gold" size="sm">
                      {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-[11px] text-luxury-muted">
                Inclusive of all applicable GST taxes. White-glove luxury packaging included.
              </p>
            </div>

            {/* Dynamic Variant Matrix Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-luxury-muted">
                    Select Edition / Flacon Volume:
                  </span>
                  <span className="font-mono text-luxury-gold-light">
                    {selectedVariant?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((v: any) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-luxury-gold text-luxury-darkest border-luxury-gold shadow-lg shadow-luxury-gold/20 font-bold'
                            : 'bg-luxury-surface/50 border-luxury-border text-white hover:border-luxury-gold/60'
                        }`}
                      >
                        <span className="block text-xs">{v.name}</span>
                        <span className="block text-[11px] opacity-90 mt-0.5">
                          ₹{v.price.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Availability */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="text-rose-400 font-bold">
                  Sold Out — Awaiting Next Limited Batch Harvest
                </span>
              ) : currentStock <= 5 ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Limited Availability: Only {currentStock} units remaining in reserve
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  In Stock for Immediate Dispatch
                </span>
              )}
            </div>

            {/* Quantity & CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-luxury-card/90 border border-luxury-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg text-luxury-muted hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm text-white min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="p-1.5 rounded-lg text-luxury-muted hover:text-white disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Shopping Bag */}
                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isCartLoading}
                  isLoading={isCartLoading}
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                >
                  Add to Shopping Bag
                </Button>
              </div>

              {/* Buy Now Direct Button */}
              <Button
                type="button"
                variant="emerald"
                size="lg"
                className="w-full"
                onClick={handleBuyNow}
                disabled={isOutOfStock || isCartLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Buy Now — Instant Checkout Handoff
              </Button>
            </div>

            {/* Indian Pincode Delivery Estimator */}
            <div className="p-5 rounded-2xl bg-luxury-surface/30 border border-luxury-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Truck className="w-4 h-4 text-luxury-gold" />
                <span>White-Glove Delivery Estimator</span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit Indian PIN (e.g. 400021)"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-luxury-dark/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold font-mono"
                />
                <Button type="submit" variant="outline" size="sm">
                  Check Serviceability
                </Button>
              </form>

              {pincodeStatus && (
                <div
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    pincodeStatus.valid
                      ? 'bg-luxury-emerald/40 border border-luxury-gold/40 text-luxury-gold-light'
                      : 'bg-rose-950/40 border border-rose-800 text-rose-300'
                  }`}
                >
                  {pincodeStatus.valid ? (
                    <>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <CheckCircle2 className="w-3.5 h-3.5 text-luxury-gold" />
                        <span>Serviceable: {pincodeStatus.timeline}</span>
                      </div>
                      <p className="text-[11px] text-luxury-muted">
                        Dispatched in sealed tamper-proof luxury packaging from Central Hub.
                      </p>
                    </>
                  ) : (
                    <span>Invalid pincode. Please enter a valid 6-digit Indian postal code.</span>
                  )}
                </div>
              )}
            </div>

            {/* Authenticity Guarantee Callout */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-luxury-muted">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-luxury-card/40 border border-luxury-border">
                <ShieldCheck className="w-4 h-4 text-luxury-gold shrink-0" />
                <span>100% Original Maison Certified</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-luxury-card/40 border border-luxury-border">
                <RotateCcw className="w-4 h-4 text-luxury-gold shrink-0" />
                <span>Complimentary Luxury Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* EDITORIAL DOSSIER TABS */}
        <div className="mt-20 border-t border-luxury-border/60 pt-10 space-y-8">
          <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-luxury-card/80 border border-luxury-border">
            {[
              { id: 'narrative', label: 'Formulation Philosophy & Highlights' },
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'ingredients', label: 'Full Ingredient Composition' },
              { id: 'how_to_use', label: 'Ritual & Application' },
              { id: 'reviews', label: `Clientèle Reviews (${product.reviews?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-luxury-gold text-luxury-darkest shadow-md font-bold'
                    : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-luxury-card/40 border border-luxury-border">
            {/* Tab 1: Narrative & Highlights */}
            {activeTab === 'narrative' && (
              <div className="space-y-6">
                {product.description && (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm text-luxury-muted leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}

                {highlights.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-luxury-border/60">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                      Key Formulation Claims & Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {highlights.map((h: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border text-xs text-white"
                        >
                          <Sparkles className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Specifications */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                  Technical Specifications Table
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(specifications).map(([k, v]) => (
                    <div
                      key={k}
                      className="p-3.5 rounded-xl bg-luxury-surface/40 border border-luxury-border flex items-center justify-between text-xs"
                    >
                      <span className="text-luxury-muted uppercase font-mono">{k}</span>
                      <span className="font-semibold text-white">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Ingredients */}
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                  Complete INCI Formula Composition
                </h4>
                <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed font-mono p-4 rounded-2xl bg-luxury-darkest border border-luxury-border">
                  {product.ingredients ||
                    'Aqua (Purified Water), 24K Pure Gold Flakes (Aurum), Niacinamide (5%), Triple-Hyaluronic Acid Complex, Kashmiri Saffron Extract, Squalane, Matrixyl 3000 Peptides.'}
                </p>
              </div>
            )}

            {/* Tab 4: How to use */}
            {activeTab === 'how_to_use' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                  Application Ritual & Ceremony
                </h4>
                <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed p-4 rounded-2xl bg-luxury-surface/40 border border-luxury-border">
                  {product.howToUse ||
                    'Warm 3–4 drops between the palms of your hands. Press gently into cleansed skin with upward sweeping motions.'}
                </p>
              </div>
            )}

            {/* Tab 5: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
                  <div>
                    <h4 className="text-base font-bold font-brand text-white">
                      Clientèle Feedback & Ratings
                    </h4>
                    <span className="text-xs text-luxury-muted">
                      Based on {product.reviews?.length || 0} verified customer evaluations
                    </span>
                  </div>
                </div>

                {product.reviews?.length === 0 ? (
                  <p className="text-xs text-luxury-muted italic">
                    Be the first distinguished patron to review this formulation.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {product.reviews?.map((rev: any) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-luxury-surface/40 border border-luxury-border space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-xs">
                            {rev.user?.firstName} {rev.user?.lastName}
                          </span>
                          <div className="flex items-center gap-1 text-luxury-gold">
                            {[...Array(rev.rating)].map((_, idx) => (
                              <Star key={idx} className="w-3 h-3 fill-luxury-gold" />
                            ))}
                          </div>
                        </div>
                        {rev.title && (
                          <h5 className="text-xs font-bold text-luxury-gold-light">{rev.title}</h5>
                        )}
                        <p className="text-xs text-luxury-muted italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RELATED / FREQUENTLY BOUGHT TOGETHER */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 space-y-8">
            <div className="border-b border-luxury-border/80 pb-4">
              <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-bold">
                Harmonious Pairings
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-brand text-white mt-1">
                Frequently Bought Together
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Sticky Mobile Add to Bag Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-luxury-darkest/95 backdrop-blur-xl border-t border-luxury-border p-3 flex items-center justify-between gap-3 z-40 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-bold font-brand text-white block truncate">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-luxury-gold font-mono truncate block">
            {selectedVariant ? selectedVariant.name : 'Standard'}
          </span>
        </div>
        <Button
          type="button"
          variant="gold"
          size="sm"
          className="shrink-0"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isCartLoading}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
        </Button>
      </div>

      <Footer />
    </div>
  );
}
