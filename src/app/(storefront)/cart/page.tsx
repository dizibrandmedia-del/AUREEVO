"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Wrench,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    toggleInstallation,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getMrpTotal,
    getSubtotal,
    getSavings,
    getCouponDiscount,
    getInstallationTotal,
    getGstAmount,
    getGrandTotal,
    deliveryCharge,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          orderAmount: getSubtotal(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        applyCoupon(data.code, data.discountValue, data.discountType);
        setCouponInput("");
      } else {
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponError("Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add smart electronics, energy-efficient appliances, or solid wood furniture to your cart.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-brand-blue" />
          Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} Items)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your selected appliances, installation preferences, and coupons
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {items.map((item) => (
              <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 p-2 shrink-0 border border-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-blue">
                        SKU: {item.sku}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                        {item.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Installation Option */}
                  {item.installationType && item.installationType !== "NOT_REQUIRED" && (
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 p-2 rounded-xl">
                      <input
                        type="checkbox"
                        checked={item.addInstallation}
                        onChange={() => toggleInstallation(item.productId)}
                        className="rounded text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-brand-violet" />
                        Include Professional Installation
                        {item.installationType === "FREE" ? (
                          <strong className="text-emerald-600">(FREE)</strong>
                        ) : (
                          <strong className="text-slate-800">(+₹{item.installationCost})</strong>
                        )}
                      </span>
                    </label>
                  )}

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                        </span>
                        {item.mrp > item.sellingPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{(item.mrp * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Frequently Bought Together Upsell */}
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Add 2-Year Extended Complete Appliance Protection?</p>
                <p className="text-slate-500 text-[11px]">Covers voltage surge, accidental physical damage & free gas charging.</p>
              </div>
            </div>
            <button
              onClick={() => alert("Extended protection plan added to bundle!")}
              className="px-3 py-1.5 bg-brand-blue text-white rounded-lg font-bold hover:bg-blue-700 transition shrink-0 text-xs"
            >
              + ₹1,499
            </button>
          </div>
        </div>

        {/* Right Order Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-brand-blue" />
              Apply Discount Coupon
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-800">{appliedCoupon.code} Applied</p>
                  <p className="text-[11px] text-emerald-600">
                    Saved ₹{getCouponDiscount().toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. AUREVO10)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Tip: Use code <strong>AUREVO10</strong> for 10% instant off.
                </p>
              </form>
            )}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-xs text-slate-600">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
              Order Pricing Summary
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span>Total MRP:</span>
                <span className="line-through text-slate-400">
                  ₹{getMrpTotal().toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Selling Price Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  ₹{getSubtotal().toLocaleString()}
                </span>
              </div>

              {getSavings() > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Catalog Retail Discount:</span>
                  <span>- ₹{getSavings().toLocaleString()}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-brand-blue font-bold">
                  <span>Coupon Discount ({appliedCoupon.code}):</span>
                  <span>- ₹{getCouponDiscount().toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Doorstep Delivery:</span>
                <span className="font-semibold text-emerald-700">
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>

              {getInstallationTotal() > 0 && (
                <div className="flex justify-between">
                  <span>Installation Service:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{getInstallationTotal().toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-100">
                <span>Includes 18% GST:</span>
                <span>₹{getGstAmount().toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Grand Total:</span>
              <span className="font-black text-xl text-slate-900">
                ₹{getGrandTotal().toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              PROCEED TO SECURE CHECKOUT
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Secure Payment with Bank Grade Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
