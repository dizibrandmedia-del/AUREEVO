"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Tag,
  Star,
  FileText,
  Calendar,
  Truck,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { generateInvoicePdf } from "@/lib/invoice";

export default function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "WARRANTY" | "ADDRESSES" | "COUPONS">("ORDERS");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Return / Warranty ticket form
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [ticketType, setTicketType] = useState("WARRANTY");
  const [ticketReason, setTicketReason] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/v1/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = (order: any) => {
    const doc = generateInvoicePdf(order);
    doc.save(`${order.orderNumber}-Tax-Invoice.pdf`);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketModalOpen(false);
      setTicketReason("");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-black text-xl border border-blue-100">
            RS
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Rahul Sharma</h1>
            <p className="text-xs text-slate-500">
              rahul.sharma@example.com • +91 98765 43210
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified AUREVO Member
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/track-order"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
          >
            Track Recent Order
          </Link>
          <button
            onClick={() => setTicketModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-violet text-white hover:bg-purple-700 text-xs font-bold transition shadow-sm"
          >
            + Raise Service Ticket
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "ORDERS", label: "My Orders & Invoices", icon: Package },
          { id: "WARRANTY", label: "Returns & Warranty Claims", icon: ShieldCheck },
          { id: "ADDRESSES", label: "Saved Delivery Addresses", icon: MapPin },
          { id: "COUPONS", label: "Exclusive Member Coupons", icon: Tag },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === t.id
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: ORDERS */}
      {activeTab === "ORDERS" && (
        <div className="space-y-4">
          {orders.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-2">
              <p className="text-sm font-semibold text-slate-700">No orders found.</p>
              <Link href="/" className="text-xs text-brand-blue font-bold hover:underline">
                Explore Products Now
              </Link>
            </div>
          )}

          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-brand-blue uppercase">
                    Order ID: {ord.orderNumber}
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    Placed on {new Date(ord.createdAt).toLocaleDateString("en-IN")} • Status:{" "}
                    <strong className="text-slate-900">{ord.orderStatus}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(ord)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-blue" />
                    Download Invoice
                  </button>

                  <Link
                    href={`/track-order?orderId=${ord.orderNumber}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-brand-blue font-bold hover:bg-blue-100"
                  >
                    Track Status
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {ord.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 p-1.5 border border-slate-100 shrink-0">
                        <img
                          src={item.productImage || "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 line-clamp-1">{item.productName}</h4>
                        <span className="text-slate-400 text-[11px]">
                          Qty: {item.quantity} • GST 18% Included
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 shrink-0">
                      ₹{item.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-700">
                <span>
                  Delivery Address: <strong>{ord.shippingAddressText}</strong>
                </span>
                <span>
                  Grand Total: <strong className="text-sm font-black text-slate-900">₹{ord.grandTotal.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: WARRANTY & RETURNS */}
      {activeTab === "WARRANTY" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Active Service & Warranty Tickets</h3>
              <p className="text-slate-500">Track claim statuses and scheduled home service</p>
            </div>
            <button
              onClick={() => setTicketModalOpen(true)}
              className="px-3.5 py-1.5 bg-brand-violet text-white font-bold rounded-xl hover:bg-purple-700"
            >
              + Raise New Ticket
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-violet">Ticket #WNT-2026-8812</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                UNDER REVIEW
              </span>
            </div>
            <p className="text-slate-800 font-semibold">
              Samsung 55-inch Crystal 4K Smart TV — Wall Mounting Demo & Panel Inspection
            </p>
            <p className="text-[11px] text-slate-500">
              Technician from Samsung Authorized Service Center assigned. Scheduled Visit: Tomorrow between 2:00 PM – 5:00 PM.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: ADDRESSES */}
      {activeTab === "ADDRESSES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-brand-blue shadow-sm text-xs space-y-2 relative">
            <span className="px-2 py-0.5 bg-blue-100 text-brand-blue font-bold rounded text-[10px]">
              DEFAULT ADDRESS
            </span>
            <h4 className="font-bold text-sm text-slate-900">Rahul Sharma (Home)</h4>
            <p className="text-slate-600 leading-relaxed">
              Flat 402, Ganga Heights, Sigra<br />
              Near IP Mall, Varanasi, Uttar Pradesh - 221010<br />
              Mobile: +91 98765 43210
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: COUPONS */}
      {activeTab === "COUPONS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { code: "AUREVO10", desc: "10% Instant Off on orders above ₹10,000", valid: "Valid till 31 Dec 2026" },
            { code: "FESTIVE2500", desc: "Flat ₹2,500 off on Inverter ACs & Refrigerators", valid: "Valid till 31 Dec 2026" },
          ].map((c) => (
            <div key={c.code} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-brand-blue text-white font-extrabold rounded-lg tracking-wider text-xs">
                  {c.code}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold">Active</span>
              </div>
              <p className="font-semibold text-slate-800">{c.desc}</p>
              <p className="text-[11px] text-slate-400">{c.valid}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-dropdown border border-slate-100 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Raise Service / Return Ticket</h3>

            {ticketSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Ticket Logged Successfully!</h4>
                <p className="text-slate-500 text-xs">Our warranty specialist will contact you within 4 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Request Type</label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="WARRANTY">Brand Warranty / Free Service Call</option>
                    <option value="REPLACEMENT">7-Day Replacement for Defect</option>
                    <option value="INSTALLATION">Installation Technician Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order ID</label>
                  <input
                    type="text"
                    required
                    defaultValue="AUR-ORD-2026-1001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Description</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketReason}
                    onChange={(e) => setTicketReason(e.target.value)}
                    placeholder="Describe the issue or schedule time for technician..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-violet text-white font-bold rounded-xl hover:bg-purple-700"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
