"use client";

import React, { useState } from "react";
import { X, CheckCircle, Sparkles, Send, PhoneCall, User, Phone, MapPin } from "lucide-react";

interface LeadModalProps {
  productName?: string;
  onClose: () => void;
}

export default function LeadModal({ productName, onClose }: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Varanasi");
  const [quantity, setQuantity] = useState("1");
  const [requirement, setRequirement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage("Please enter your name and 10-digit mobile number.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          quantity: parseInt(quantity, 10) || 1,
          productName: productName || "Direct Enquiry",
          requirement: requirement.trim() || "Requested best price quote from product card.",
          leadSource: "GET_BEST_PRICE",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit enquiry.");
      }
    } catch (err: any) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-dropdown border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-dark-gradient text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-brand-gold/20 text-brand-gold-light border border-brand-gold/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider font-luxury">
              Exclusive Quote
            </span>
          </div>
          <h3 className="text-xl font-bold font-luxury">Get Instant Best Price</h3>
          <p className="text-xs text-slate-300 mt-1">
            Looking for {productName ? `"${productName}"` : "bulk or special pricing"}?
            Our direct supplier desk will share the lowest discounted quote.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-luxury">Quote Request Received</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you, <strong>{name}</strong>! Our sales executive is preparing
                the quotation. We will message you on WhatsApp at <strong>{phone}</strong> shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-black transition"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name or company"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery City *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Varanasi, Lucknow, Patna..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Required
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold bg-white"
                >
                  <option value="1">1 Unit (Individual Purchase)</option>
                  <option value="2">2 - 5 Units (Home / Commercial)</option>
                  <option value="6">6 - 20 Units (Bulk / Institutional)</option>
                  <option value="25">25+ Units (Enterprise / Hotel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="Need faster installation, GST input invoice, or matching accessories..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-sm shadow-md hover:shadow-gold-glow transition flex items-center justify-center gap-2 uppercase font-luxury tracking-wider disabled:opacity-50"
              >
                {submitting ? "Submitting Request..." : "Request Best Price Quotation"}
                <Send className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <PhoneCall className="w-3 h-3 text-emerald-500" />
                No spam. Direct quotation from authorized brand partners.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
