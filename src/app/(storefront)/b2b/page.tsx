"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  PhoneCall,
  Mail,
  ShieldCheck,
  Truck,
  Percent,
  Send,
  FileText,
} from "lucide-react";

export default function B2BPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("Hotel / Hospitality");
  const [products, setProducts] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [requirement, setRequirement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !phone || !products) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactPerson,
          phone,
          email,
          city,
          businessType,
          products,
          quantity: parseInt(quantity, 10) || 1,
          requirement,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Submission failed.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Banner */}
      <div className="bg-gradient-to-br from-brand-dark via-brand-emerald to-[#041411] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-brand-gold/30">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold-light border border-brand-gold/40 text-xs font-bold uppercase tracking-wider font-luxury">
            <Building2 className="w-3.5 h-3.5 text-brand-gold" />
            AUREVO Institutional &amp; Enterprise Division
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-luxury text-white">
            Bulk &amp; Corporate Procurement
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
            Empowering hotels, corporate offices, builders, schools, and healthcare institutions with wholesale manufacturer pricing, flexible payment credit terms, customized GST input invoices, and dedicated turnkey installation teams.
          </p>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-gold/25 shadow-sm space-y-2">
          <Percent className="w-6 h-6 text-brand-gold" />
          <h3 className="font-bold text-sm text-brand-dark font-luxury">Direct Distributor Pricing</h3>
          <p className="text-xs text-slate-500">
            Unbeatable volume slab discounts straight from authorized Indian distributors.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-gold/25 shadow-sm space-y-2">
          <FileText className="w-6 h-6 text-brand-gold" />
          <h3 className="font-bold text-sm text-brand-dark font-luxury">GST Input Tax Credit</h3>
          <p className="text-xs text-slate-500">
            Official B2B invoices compliant with 18% &amp; 28% GST input credit for your firm.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-gold/25 shadow-sm space-y-2">
          <Truck className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-sm text-brand-dark font-luxury">Turnkey Multi-Location Delivery</h3>
          <p className="text-xs text-slate-500">
            Dedicated logistics fleet with professional on-site mounting, wiring, and testing.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Submit Institutional RFQ / Enquiry
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Fill out the form below. An Enterprise Account Executive will contact you within 2 hours with customized rate sheets.
        </p>

        {submitted ? (
          <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-900">RFQ Successfully Received!</h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Your inquiry has been allocated to our Corporate Key Accounts Manager. We will prepare your wholesale pricing quote and dispatch it to your email and WhatsApp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <p className="text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Radisson Blu / Grand Heights Infra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Amit Kapoor (Procurement Head)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="procurement@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Delivery Location *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Varanasi / Delhi NCR"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Sector</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  <option value="Hotel / Hospitality">Hotel / Hospitality</option>
                  <option value="Corporate Office">Corporate Office / IT Park</option>
                  <option value="Real Estate / Builder">Real Estate / Builder Project</option>
                  <option value="Hospital / Healthcare">Hospital / Healthcare</option>
                  <option value="School / College">School / College</option>
                  <option value="Restaurant / Cafe">Restaurant / Commercial Kitchen</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Products Required *</label>
              <input
                type="text"
                required
                value={products}
                onChange={(e) => setProducts(e.target.value)}
                placeholder="e.g. 25 Units 1.5T Split ACs + 20 Units 43-inch Smart TVs"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Delivery Month</label>
                <input
                  type="text"
                  placeholder="e.g. Next Month"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specific Requirements / Brand Preferences</label>
              <textarea
                rows={3}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Specify preferred brands (LG, Samsung, Voltas), warranty terms, or site readiness..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-dark hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting Corporate RFQ..." : "SUBMIT CORPORATE RFQ"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
