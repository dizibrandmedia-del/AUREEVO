"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Truck,
  Wrench,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "../../../lib/store";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    appliedCoupon,
    deliveryCharge,
    getMrpTotal,
    getSubtotal,
    getCouponDiscount,
    getInstallationTotal,
    getGstAmount,
    getGrandTotal,
    clearCart,
  } = useCartStore();

  const [step, setStep] = useState<"ADDRESS" | "DELIVERY" | "PAYMENT">("ADDRESS");

  // Form states
  const [customerName, setCustomerName] = useState("Rahul Sharma");
  const [customerPhone, setCustomerPhone] = useState("9876543210");
  const [customerEmail, setCustomerEmail] = useState("rahul.sharma@example.com");
  const [streetAddress, setStreetAddress] = useState("Flat 402, Ganga Heights, Sigra");
  const [city, setCity] = useState("Varanasi");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("221010");
  const [landmark, setLandmark] = useState("Near IP Mall");

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim() || !pincode.trim()) {
      setOrderError("Please complete all required shipping address fields.");
      setStep("ADDRESS");
      return;
    }

    setSubmitting(true);
    setOrderError("");

    try {
      const fullAddress = `${streetAddress}, ${landmark ? landmark + ", " : ""}${city}, ${state} - ${pincode}`;

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress: fullAddress,
          pincode,
          items,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          couponDiscount: getCouponDiscount(),
          deliveryCharge,
          installationCharge: getInstallationTotal(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/track-order?orderId=${data.orderNumber}`);
      } else {
        setOrderError(data.error || "Order placement failed.");
      }
    } catch (err: any) {
      setOrderError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add products before proceeding to checkout.</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="max-w-xl mx-auto flex items-center justify-between text-xs font-bold">
        <button
          onClick={() => setStep("ADDRESS")}
          className={`flex items-center gap-1.5 pb-2 border-b-2 transition ${
            step === "ADDRESS"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-[10px]">
            1
          </span>
          Shipping Address
        </button>

        <button
          onClick={() => setStep("DELIVERY")}
          className={`flex items-center gap-1.5 pb-2 border-b-2 transition ${
            step === "DELIVERY"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-[10px]">
            2
          </span>
          Delivery & Setup
        </button>

        <button
          onClick={() => setStep("PAYMENT")}
          className={`flex items-center gap-1.5 pb-2 border-b-2 transition ${
            step === "PAYMENT"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-[10px]">
            3
          </span>
          Payment & Confirm
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form View */}
        <div className="lg:col-span-8 space-y-6">
          {orderError && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {orderError}
            </div>
          )}

          {/* STEP 1: Address */}
          {step === "ADDRESS" && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-brand-blue" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Delivery Address</h3>
                  <p className="text-xs text-slate-500">Enter where you'd like your order delivered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number (for delivery SMS) *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Email Address (for GST invoice PDF) *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">House / Flat / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("DELIVERY")}
                  className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
                >
                  Continue to Delivery <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery & Installation */}
          {step === "DELIVERY" && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Truck className="w-5 h-5 text-brand-blue" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Delivery & Installation Schedule</h3>
                  <p className="text-slate-500">AUREVO Logistics Fleet Dispatch</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Scheduled Express Delivery: Next Business Day
                </div>
                <p className="text-slate-600 text-[11px]">
                  All high-value electronics and fragile appliances travel with comprehensive transit insurance.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-brand-violet">
                  <Wrench className="w-4 h-4 text-brand-violet" />
                  Professional Installation: Scheduled upon delivery
                </div>
                <p className="text-slate-600 text-[11px]">
                  Authorized service engineers carry manufacturer-approved wall brackets, piping, and wiring kits.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("ADDRESS")}
                  className="text-xs text-slate-600 hover:underline"
                >
                  ← Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setStep("PAYMENT")}
                  className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === "PAYMENT" && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-brand-blue" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Select Payment Method</h3>
                  <p className="text-slate-500">Secure 256-bit encrypted transaction</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: "UPI", title: "Instant UPI (PhonePe / Google Pay / Paytm / QR)", badge: "Most Popular" },
                  { id: "CARD", title: "Credit Card / Debit Card (Visa, Mastercard, RuPay)", badge: "Instant Offers" },
                  { id: "NETBANKING", title: "Net Banking (SBI, HDFC, ICICI, Axis & 50+ Banks)" },
                  { id: "EMI", title: "No Cost EMI on Credit & Debit Cards" },
                  { id: "COD", title: "Cash on Delivery (Pay upon doorstep unboxing)" },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === pm.id
                        ? "border-brand-blue bg-blue-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="font-bold text-slate-800">{pm.title}</span>
                    </div>
                    {pm.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-brand-blue">
                        {pm.badge}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("DELIVERY")}
                  className="text-xs text-slate-600 hover:underline"
                >
                  ← Back to Delivery
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {submitting ? "Confirming Order..." : `PAY & PLACE ORDER (₹${getGrandTotal().toLocaleString()})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Order Summary & Trust Pillar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-xs text-slate-600">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
              Order Summary ({items.length} Items)
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.productId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img src={i.image} alt={i.name} className="w-10 h-10 object-contain rounded border p-1" />
                    <div>
                      <p className="font-semibold text-slate-800 line-clamp-1">{i.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {i.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(i.sellingPrice * i.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{getSubtotal().toLocaleString()}</span>
              </div>
              {getCouponDiscount() > 0 && (
                <div className="flex justify-between text-brand-blue font-bold">
                  <span>Coupon Discount:</span>
                  <span>- ₹{getCouponDiscount().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="text-emerald-700 font-bold">
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>
              {getInstallationTotal() > 0 && (
                <div className="flex justify-between">
                  <span>Installation:</span>
                  <span>₹{getInstallationTotal().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Taxes (18% GST Included):</span>
                <span>₹{getGstAmount().toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Payable:</span>
              <span className="font-black text-xl text-slate-900">
                ₹{getGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              AUREVO 100% Assurance
            </div>
            <p>
              Your order is protected by standard brand warranty, 7-day replacement guarantee, and doorstep verified delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
