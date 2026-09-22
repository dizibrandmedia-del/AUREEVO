"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Zap,
  Star,
  ShieldCheck,
  Wrench,
  Truck,
  MessageCircle,
  PhoneCall,
  Share2,
  Layers,
  CheckCircle2,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import { useCartStore, useWishlistStore, useCompareStore } from "@/lib/store";
import LeadModal from "./LeadModal";
import ProductCard from "./ProductCard";

interface ProductDetailViewProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("221001");
  const [pincodeStatus, setPincodeStatus] = useState<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const isInCompare = useCompareStore((s) => s.isInCompare(product.id));

  const images = product.images && product.images.length > 0
    ? product.images.map((img: any) => typeof img === "string" ? img : img.url)
    : ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"];

  const activeImage = images[selectedImageIndex] || images[0];

  const savings = Math.max(0, product.mrp - product.sellingPrice);
  const discountPercent =
    product.discountPercent ||
    (product.mrp > 0 ? Math.round((savings / product.mrp) * 100) : 0);
  const emiAmount = Math.round(product.sellingPrice / 6);

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  const handleBuyNow = () => {
    addItem(product, 1);
    router.push("/checkout");
  };

  const handleWhatsAppEnquiry = () => {
    const msg = `Hi, I am interested in ${product.name} (SKU: ${product.sku}). Please share your best price and availability.`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`/api/v1/shipping/pincode?pincode=${pincodeInput}`);
      const data = await res.json();
      setPincodeStatus(data);
    } catch (err) {
      setPincodeStatus({ error: "Failed to verify pincode." });
    } finally {
      setPincodeLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-blue">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/category/${product.category?.slug}`} className="hover:text-brand-blue">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Two-Column Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Gallery & Thumbnails */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Visual Frame */}
          <div className="relative aspect-square w-full bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-center overflow-hidden shadow-sm group">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-brand-blue text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10">
                {discountPercent}% OFF
              </span>
            )}

            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition ${
                isInWishlist
                  ? "bg-red-50 text-red-500 shadow-md"
                  : "bg-slate-100 text-slate-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500" : ""}`} />
            </button>

            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl bg-white border-2 p-2 shrink-0 transition ${
                    selectedImageIndex === idx
                      ? "border-brand-gold shadow-gold-glow"
                      : "border-slate-200 hover:border-brand-gold/50"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Value Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-brand-border/70 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-gold-dark shrink-0" />
              <span className="font-medium">{product.warrantyMonths ? `${product.warrantyMonths / 12} Yrs Warranty` : "Brand Warranty"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-gold-dark shrink-0" />
              <span className="font-medium">White Glove Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-gold-dark shrink-0" />
              <span className="font-medium">{product.installationType === "FREE" ? "Free Installation" : "Installation Support"}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Meta, Pricing & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-luxury font-bold text-xs text-brand-gold-dark uppercase tracking-widest">
                {product.brand?.name} • SKU: {product.sku}
              </span>
              <button
                onClick={() => toggleCompare(product)}
                className={`text-xs flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border transition ${
                  isInCompare
                    ? "bg-brand-gold/15 text-brand-gold-dark border-brand-gold/40 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {isInCompare ? "Added to Compare" : "Compare Product"}
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-text leading-snug">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-brand-emerald text-brand-gold-light border border-brand-gold/30 px-2.5 py-0.5 rounded-md font-black">
                <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                <span>4.8</span>
              </div>
              <span className="text-slate-500 font-medium">
                (128 Verified Ratings & Reviews)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> In Stock & Ready for White-Glove Dispatch
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-3xl bg-brand-bg/70 border border-brand-border/80 space-y-2.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-brand-text">
                ₹{product.sellingPrice.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-black text-brand-gold-light bg-brand-emerald border border-brand-gold/30 px-2.5 py-0.5 rounded-full">
                  Save ₹{savings.toLocaleString("en-IN")} ({discountPercent}% OFF)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Inclusive of all taxes (GST 18% input credit eligible with official invoice)
            </p>

            <div className="pt-2.5 border-t border-brand-border/60 flex items-center justify-between text-xs text-slate-700">
              <span>
                Standard No-Cost EMI starting from <strong className="text-slate-900">₹{emiAmount.toLocaleString()}/month</strong>
              </span>
              <span className="text-brand-gold-dark font-bold">View EMI Plans</span>
            </div>
          </div>

          {/* Pincode & Delivery Checker */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Truck className="w-4 h-4 text-brand-gold-dark" />
                Check Delivery & Installation Time
              </span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-2 rounded-xl border border-brand-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
              />
              <button
                type="submit"
                disabled={pincodeLoading}
                className="px-5 py-2 bg-brand-emerald hover:bg-brand-dark text-brand-gold-light rounded-xl font-bold border border-brand-gold/40 transition disabled:opacity-50 font-luxury uppercase text-[11px]"
              >
                {pincodeLoading ? "..." : "Check"}
              </button>
            </form>

            {pincodeStatus && (
              <div className="pt-2 text-[11px] text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Delivery available to {pincodeStatus.city || "your location"} by tomorrow!
                </p>
                <p className="text-slate-500">
                  Installation service: {pincodeStatus.installationAvailable ? "Available within 48h of delivery" : "Self-setup"}
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              className="py-3.5 px-4 rounded-2xl border-2 border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-brand-gold-light font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              ADD TO CART
            </button>

            <button
              onClick={handleBuyNow}
              className="py-3.5 px-4 rounded-2xl bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black text-sm tracking-wider uppercase font-luxury shadow-lg hover:shadow-gold-glow transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              BUY NOW
            </button>
          </div>

          {/* Omnichannel Quoting Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLeadModalOpen(true)}
              className="py-2.5 px-2 bg-brand-emerald hover:bg-brand-dark text-brand-gold-light border border-brand-gold/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow font-luxury"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Get Best Price
            </button>

            <button
              type="button"
              onClick={handleWhatsAppEnquiry}
              className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>

            <a
              href="tel:+919876543210"
              className="py-2.5 px-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Desk
            </a>
          </div>

          {/* Value Assurances */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 font-luxury">
              AUREVO Royal Assurances
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-brand-gold/10 border border-brand-gold/25 rounded-xl">
                <p className="font-bold text-brand-dark font-luxury">Brand Warranty</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  100% genuine brand manufacturer warranty with tax invoice.
                </p>
              </div>

              <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/25 rounded-xl">
                <p className="font-bold text-brand-emerald font-luxury">Delivery &amp; Unboxing</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Handled with transit insurance by AUREVO Logistics Fleet. Physical inspection done at doorstep.
                </p>
              </div>

              <div className="p-3 bg-brand-gold/10 border border-brand-gold/25 rounded-xl">
                <p className="font-bold text-brand-dark font-luxury">Easy Replacement</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {product.returnPolicyDays || 7}-day replacement guarantee in case of verified transit damage or technical defect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-200">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Product Highlights</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.fullDescription || product.shortDescription}
            </p>
          </div>

          {/* Attributes Matrix */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {product.attributes.map((attr: any, i: number) => (
                  <div key={i} className="py-2.5 grid grid-cols-2 gap-4">
                    <span className="font-semibold text-slate-500">{attr.attributeName}</span>
                    <span className="font-bold text-slate-900">{attr.attributeValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Warranty, Installation & Terms */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-lg font-bold text-slate-900">Warranty & Services</h3>
            <div className="space-y-3 text-slate-600">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="font-bold text-brand-blue">Official Manufacturer Warranty</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {product.warrantyDetails || "1 Year Standard Comprehensive Brand Warranty"}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="font-bold text-emerald-800">Delivery & Unboxing</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Handled with transit insurance by AUREVO Logistics Fleet. Physical inspection done at doorstep.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl">
                <p className="font-bold text-brand-violet">Easy Replacement</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {product.returnPolicyDays || 7}-day replacement guarantee in case of verified transit damage or technical defect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Carousel/Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Similar Recommended Products</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rel: any) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isLeadModalOpen && (
        <LeadModal
          productName={product.name}
          onClose={() => setIsLeadModalOpen(false)}
        />
      )}
    </div>
  );
}
