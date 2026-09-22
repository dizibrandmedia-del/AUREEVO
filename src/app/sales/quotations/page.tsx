"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Download,
  MessageCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";
import { generateQuotationPdf } from "@/lib/invoice";

interface ItemRow {
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New quotation form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [validityDays, setValidityDays] = useState(15);
  const [terms, setTerms] = useState(
    "100% genuine brand warranty. Free home delivery and installation within 48 hours of order confirmation."
  );

  const [items, setItems] = useState<ItemRow[]>([
    {
      productName: "Samsung 55-inch Crystal 4K Vivid Pro Smart TV",
      quantity: 1,
      unitPrice: 42990,
      discount: 2000,
      total: 40990,
    },
    {
      productName: "LG 1.5 Ton 5 Star AI Dual Inverter Split AC",
      quantity: 1,
      unitPrice: 44490,
      discount: 2500,
      total: 41990,
    },
    {
      productName: "AUREVO Royal Teakwood King Hydraulic Bed",
      quantity: 1,
      unitPrice: 39999,
      discount: 4000,
      total: 35999,
    },
  ]);

  const loadQuotations = async () => {
    // Initial seeded quotation
    setQuotations([
      {
        id: "qt-1",
        quoteNumber: "QT-2026-001",
        customerName: "Vikas Singhania",
        customerPhone: "9822114455",
        customerEmail: "vikas.singhania@gmail.com",
        subtotal: 194999,
        discount: 5000,
        gstAmount: 34199,
        totalAmount: 189999,
        status: "SENT",
        validityDate: new Date("2026-10-31"),
        terms:
          "100% genuine brand warranty. Free home delivery and installation within 48 hours of order confirmation.",
        items: [
          {
            productName:
              "Gold Complete Wedding Package (TV, Refrigerator, Washer, Microwave, King Bed)",
            quantity: 1,
            unitPrice: 194999,
            discount: 5000,
            total: 189999,
          },
        ],
      },
    ]);
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productName: "Whirlpool 265L Frost-Free Double Door Refrigerator",
        quantity: 1,
        unitPrice: 27990,
        discount: 1500,
        total: 26490,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalDiscount = items.reduce((s, i) => s + i.discount, 0);
  const finalAmount = Math.max(0, subtotal - totalDiscount);

  const handleDownloadPdf = (quote: any) => {
    const doc = generateQuotationPdf(quote);
    doc.save(`${quote.quoteNumber}-AUREVO-Quotation.pdf`);
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || items.length === 0) return;

    const newQuote = {
      id: `qt-${Date.now()}`,
      quoteNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      customerPhone,
      customerEmail,
      subtotal,
      discount: totalDiscount,
      totalAmount: finalAmount,
      status: "SENT",
      validityDate: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
      terms,
      items,
    };

    setQuotations([newQuote, ...quotations]);
    setModalOpen(false);
    handleDownloadPdf(newQuote);
  };

  const handleSendWhatsApp = (quote: any) => {
    const msg = `Hi ${quote.customerName}, here is your official AUREVO.digital commercial quotation #${quote.quoteNumber} for a total package price of INR ${quote.totalAmount.toLocaleString()}. Our sales specialist will call you for final scheduling!`;
    window.open(`https://wa.me/91${quote.customerPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Commercial Quotations Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export custom client quotations (PDF, WhatsApp, and Email)
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-violet hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Custom Quotation
        </button>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotations.map((q) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-brand-violet uppercase">
                  Quote Ref: {q.quoteNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900">{q.customerName}</h3>
                <p className="text-slate-500 text-[11px]">
                  Mobile: {q.customerPhone} {q.customerEmail && `• ${q.customerEmail}`}
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-brand-blue">
                {q.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quoted Items ({q.items?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {q.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-slate-700">
                    <span className="line-clamp-1">{item.productName} (x{item.quantity})</span>
                    <strong>₹{item.total.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-700">Total Quoted Package:</span>
              <span className="font-black text-lg text-brand-violet">
                ₹{q.totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => handleSendWhatsApp(q)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Quote
              </button>

              <button
                onClick={() => handleDownloadPdf(q)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-violet text-white hover:bg-purple-700 rounded-xl font-bold"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quotation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-dropdown border border-slate-100 space-y-4 text-xs my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                New Sales Commercial Quotation
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Items List Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Quotation Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-brand-violet font-bold hover:underline"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, productName: val } : it))
                            );
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItems((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, unitPrice: val, total: val - it.discount } : it
                              )
                            );
                          }}
                          placeholder="Price"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItems((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, discount: val, total: it.unitPrice - val } : it
                              )
                            );
                          }}
                          placeholder="Disc"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-2 font-bold text-slate-900">
                        ₹{item.total.toLocaleString()}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-baseline font-bold text-sm">
                <span>Final Quotation Amount:</span>
                <span className="text-brand-violet text-lg font-black">
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Terms & Delivery Notes</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-violet text-white font-bold rounded-xl hover:bg-purple-700 shadow-md"
                >
                  Generate & Export PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
