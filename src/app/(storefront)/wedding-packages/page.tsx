"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Tv,
  Refrigerator,
  Wind,
  UtensilsCrossed,
  Armchair,
  ArrowRight,
  Send,
  Download,
  PhoneCall,
} from "lucide-react";

interface PackageItem {
  category: string;
  model: string;
  value: number;
  selected?: boolean;
}

const BUDGET_TIERS = [
  { id: "1_LAKH", name: "₹1 Lakh Starter", budget: 100000, discount: 25000 },
  { id: "2_LAKH", name: "₹2 Lakh Complete", budget: 200000, discount: 50000 },
  { id: "3_LAKH", name: "₹3 Lakh Luxury Suite", budget: 300000, discount: 75000 },
  { id: "5_LAKH", name: "₹5 Lakh Royal Palace", budget: 500000, discount: 120000 },
  { id: "10_LAKH_PLUS", name: "₹10 Lakh+ Emperor", budget: 1000000, discount: 250000 },
];

const DEFAULT_BUNDLE_ITEMS: PackageItem[] = [
  { category: "Smart Television", model: "55-inch Crystal 4K Ultra HD Smart TV", value: 44990, selected: true },
  { category: "Double Door Refrigerator", model: "265L 3-Star Inverter Frost-Free Fridge", value: 27990, selected: true },
  { category: "Split Air Conditioner", model: "1.5 Ton 5 Star AI Inverter Split AC", value: 44490, selected: true },
  { category: "Washing Machine", model: "8 kg 5 Star Inverter Front Load Washer", value: 37990, selected: true },
  { category: "Kitchen Appliances", model: "750W 4-Jar Mixer Grinder + 23L Microwave", value: 18990, selected: true },
  { category: "Teakwood Bedroom Set", model: "King Size Hydraulic Storage Bed + Dual Ortho Mattress", value: 49990, selected: true },
  { category: "Living Room Sofa", model: "3+1+1 High Comfort Fabric Sofa Set", value: 32000, selected: true },
  { category: "Dining Table Set", model: "6-Seater Solid Wood Dining Table with Chairs", value: 28000, selected: false },
  { category: "Auto-Clean Chimney & Hob", model: "Filterless Touch Control Chimney + 3-Burner Hob", value: 21990, selected: false },
];

export default function WeddingPackagesPage() {
  const [selectedTier, setSelectedTier] = useState("2_LAKH");
  const [items, setItems] = useState<PackageItem[]>(DEFAULT_BUNDLE_ITEMS);

  // Customer quote form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("Varanasi");
  const [weddingDate, setWeddingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState("");

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectedItems = items.filter((i) => i.selected);
  const rawTotal = selectedItems.reduce((s, i) => s + i.value, 0);

  // Calculate tier bundle discount
  const activeTierObj = BUDGET_TIERS.find((t) => t.id === selectedTier) || BUDGET_TIERS[1];
  const bundleDiscount = Math.round(rawTotal * 0.18); // 18% special bundle discount
  const finalPackagePrice = Math.max(0, rawTotal - bundleDiscount);

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Please provide your name and mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedItemNames = selectedItems.map((i) => `${i.category}: ${i.model}`).join(", ");
      const requirementText = `Wedding Budget: ${activeTierObj.name}. Target Date: ${weddingDate || "Upcoming"}. Selected Items: ${selectedItemNames}. Notes: ${notes || "None"}`;

      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          city: customerCity.trim(),
          leadSource: "WEDDING_PACKAGE",
          productName: `Wedding Package: ${activeTierObj.name}`,
          budgetRange: activeTierObj.name,
          requirement: requirementText,
          quantity: selectedItems.length,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setQuoteSuccessMsg(
          "Your Wedding Home Package quotation request has been routed to our Senior Sales Specialist. You will receive an official PDF quotation on WhatsApp & SMS shortly."
        );
      }
    } catch (err) {
      alert("Failed to send quotation request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-dark via-brand-emerald to-[#041411] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl border border-brand-gold/30">
        {/* Ambient Royal Gold Glow Background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-emerald-light/40 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/20 text-brand-gold-light border border-brand-gold/40 text-xs font-bold uppercase tracking-wider font-luxury backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            AUREVO Wedding &amp; New Home Makeover Studio
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-luxury text-white drop-shadow-sm">
            Build Your Dream Home Package
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-sans">
            Starting a new chapter? Save up to ₹1,50,000 with our comprehensive royal wedding bundles. Select top-tier 4K TVs, Inverter ACs, Double Door Refrigerators, Kitchen Chimneys, and Solid Wood Master Beds with guaranteed doorstep delivery and free assembly.
          </p>

          {/* Budget Tier Selector */}
          <div className="flex flex-wrap justify-center gap-2.5 pt-6">
            {BUDGET_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                  selectedTier === tier.id
                    ? "bg-gold-gradient text-brand-dark shadow-gold-glow scale-105 font-black border border-amber-300 font-luxury"
                    : "bg-white/10 hover:bg-white/20 text-white border border-brand-gold/25 hover:border-brand-gold/60"
                }`}
              >
                {tier.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Package Customization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selectable Package Appliances & Furniture */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div>
              <h2 className="text-lg font-bold text-brand-dark font-luxury">
                Customize Package Items ({selectedItems.length} Selected)
              </h2>
              <p className="text-xs text-slate-500">
                Check or uncheck items according to your exact room and lifestyle needs
              </p>
            </div>
            <span className="text-xs text-brand-gold-dark font-bold bg-brand-gold/10 border border-brand-gold/30 px-3.5 py-1 rounded-full font-luxury">
              Bundle Discount Applied
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => toggleItem(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                  item.selected
                    ? "border-brand-gold bg-brand-gold/5 shadow-sm ring-1 ring-brand-gold/30"
                    : "border-slate-200 bg-white hover:border-brand-gold/40 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => {}} // handled by parent div onClick
                    className="w-4 h-4 rounded text-brand-emerald focus:ring-brand-gold accent-[#0B2B26]"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-wider font-luxury">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-brand-dark">
                      {item.model}
                    </h4>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-brand-dark font-luxury">
                    ₹{item.value.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-bold">
                    ✓ Free Installation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Quotation Calculator & CRM Submission */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-gold/25 shadow-md space-y-4 text-xs text-slate-600">
            <h3 className="font-bold text-sm text-brand-dark pb-3 border-b border-brand-border font-luxury">
              Package Price Calculation
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span>Individual Retail Total:</span>
                <span className="line-through text-slate-400">
                  ₹{rawTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Special Wedding Bundle Discount (18%):</span>
                <span>- ₹{bundleDiscount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery &amp; Professional Assembly:</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>

              <div className="flex justify-between">
                <span>100% Genuine Brand Warranty:</span>
                <span className="text-emerald-700 font-bold">INCLUDED</span>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
              <span className="font-bold text-sm text-brand-dark font-luxury">Final Package Quote:</span>
              <span className="font-black text-2xl text-brand-emerald font-luxury">
                ₹{finalPackagePrice.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-[11px] text-brand-dark">
              ⚡ You save <strong className="text-emerald-700 font-bold">₹{bundleDiscount.toLocaleString()}</strong> instantly by bundling with AUREVO.digital!
            </div>
          </div>

          {/* Quotation Request Form */}
          <div className="bg-white p-6 rounded-3xl border border-brand-gold/25 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-brand-dark font-luxury">
              Request Official Quotation
            </h3>
            <p className="text-xs text-slate-500">
              Our Senior Sales Specialist will prepare a formal GST quotation PDF and schedule doorstep delivery.
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-xs font-luxury">Quotation Request Logged!</h4>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  {quoteSuccessMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestQuote} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rajesh Singhania"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custom Notes / Brands</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Prefer Sony TV and LG Washing Machine..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-xs shadow-md hover:shadow-gold-glow transition flex items-center justify-center gap-1.5 uppercase font-luxury tracking-wider disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Submitting Request..." : "GET OFFICIAL SALES QUOTATION"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
