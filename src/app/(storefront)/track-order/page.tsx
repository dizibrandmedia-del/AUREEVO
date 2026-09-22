"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  FileText,
  PhoneCall,
  MapPin,
  Calendar,
} from "lucide-react";
import { generateInvoicePdf } from "@/lib/invoice";

const TIMELINE_STEPS = [
  { key: "CONFIRMED", label: "Order Confirmed", icon: CheckCircle2 },
  { key: "SUPPLIER_PROCESSING", label: "Supplier Processing", icon: Clock },
  { key: "PACKED", label: "Packed at Warehouse", icon: Package },
  { key: "SHIPPED", label: "In Transit", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/orders?orderNumber=${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data.order);
      } else {
        setError(data.error || "Order not found. Please verify your order number.");
        setOrderData(null);
      }
    } catch (err) {
      setError("Network error looking up order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    } else {
      // Default query sample seeded order
      fetchOrder("AUR-ORD-2026-1001");
    }
  }, [initialOrderId]);

  const handleDownloadInvoice = () => {
    if (!orderData) return;
    const doc = generateInvoicePdf(orderData);
    doc.save(`${orderData.orderNumber}-Tax-Invoice.pdf`);
  };

  const getStepIndex = (status: string) => {
    const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStepIndex = orderData ? getStepIndex(orderData.orderStatus) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Lookup Box */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Track Your Order & Delivery
        </h1>
        <p className="text-xs text-slate-500">
          Enter your Order ID (e.g. AUR-ORD-2026-1001) to view real-time delivery status, courier tracking, and download official tax invoice.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrder(orderQuery);
          }}
          className="pt-4 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter Order ID"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
      </div>

      {/* Order Status Display */}
      {orderData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Order Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-brand-blue uppercase">
                Order Tracking Milestone
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Order #{orderData.orderNumber}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Placed on {new Date(orderData.createdAt).toLocaleDateString("en-IN")} • Total:{" "}
                <strong className="text-slate-900">₹{orderData.grandTotal.toLocaleString()}</strong> ({orderData.paymentMethod})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-xs font-bold transition border border-slate-200"
              >
                <FileText className="w-4 h-4 text-brand-blue" />
                Download Tax Invoice PDF
              </button>

              <a
                href="tel:+919876543210"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition border border-emerald-200"
              >
                <PhoneCall className="w-4 h-4" />
                Delivery Support
              </a>
            </div>
          </div>

          {/* Visual Milestone Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h4 className="font-bold text-sm text-slate-900">Shipment Timeline</h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {TIMELINE_STEPS.map((stepItem, idx) => {
                const Icon = stepItem.icon;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={stepItem.key} className="flex flex-col items-center text-center relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        isPassed
                          ? "bg-brand-blue text-white shadow-md shadow-blue-500/25"
                          : "bg-slate-100 text-slate-400"
                      } ${isCurrent ? "ring-4 ring-blue-100 animate-pulse" : ""}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`mt-2 text-xs font-bold line-clamp-1 ${
                        isPassed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {stepItem.label}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] text-brand-blue font-semibold mt-0.5">
                        Current Status
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Courier & Tracking Details */}
            {orderData.shipments && orderData.shipments.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-blue" />
                    <span className="font-bold text-slate-800">
                      Courier: {orderData.shipments[0].courierName || "AUREVO Express Fleet"}
                    </span>
                  </div>
                  <span className="text-slate-500">
                    AWB / Tracking No:{" "}
                    <strong className="text-slate-900">{orderData.shipments[0].trackingNumber}</strong>
                  </span>
                </div>
                {orderData.shipments[0].notes && (
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                    {orderData.shipments[0].notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery Address & Items Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-blue" />
                Delivery Address
              </h4>
              <p className="text-slate-700 leading-relaxed">
                <strong>{orderData.customerName}</strong> ({orderData.customerPhone})<br />
                {orderData.shippingAddressText}<br />
                PIN: <strong>{orderData.pincode}</strong>
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-brand-blue" />
                Ordered Items ({orderData.items?.length || 0})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {orderData.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-slate-700">
                    <span className="line-clamp-1">{item.productName} (x{item.quantity})</span>
                    <strong className="text-slate-900">₹{item.total.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold">Loading order tracking...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

