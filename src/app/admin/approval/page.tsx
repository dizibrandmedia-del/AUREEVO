"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  FileCheck,
  RotateCcw,
} from "lucide-react";

export default function ProductApprovalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/products?limit=100&status=ALL");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAction = async (id: string, action: string, reason?: string) => {
    try {
      const res = await fetch(`/api/v1/products/${id}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        loadProducts();
        setTimeout(() => setActionMessage(""), 4000);
      } else {
        alert(data.error || "Action failed.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      alert("A rejection reason is required.");
      return;
    }
    handleAction(selectedProductId, "REJECT", rejectionReason);
    setRejectModalOpen(false);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Product Listing Approval Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Draft → Listing Team Submitted → Under Review → Approved → Published
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Product / SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Pricing</th>
              <th className="p-4">Current Status</th>
              <th className="p-4 text-right">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
                      }
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded border p-1"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-700 font-medium">{p.category?.name}</td>
                <td className="p-4 font-bold text-brand-blue">{p.brand?.name}</td>
                <td className="p-4">
                  <span className="font-bold text-slate-900">₹{p.sellingPrice.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 line-through">
                    ₹{p.mrp.toLocaleString()}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : p.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.rejectionReason && (
                    <span className="block text-[10px] text-red-500 mt-0.5 max-w-xs">
                      Reason: {p.rejectionReason}
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-1.5">
                  {p.status !== "PUBLISHED" && (
                    <button
                      onClick={() => handleAction(p.id, "PUBLISH")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      Approve & Publish
                    </button>
                  )}

                  {p.status === "PUBLISHED" && (
                    <button
                      onClick={() => handleAction(p.id, "UNPUBLISH")}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
                    >
                      Unpublish
                    </button>
                  )}

                  {p.status !== "REJECTED" && (
                    <button
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setRejectModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-dropdown border border-slate-100 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Product Listing
            </h3>
            <p className="text-slate-500">
              Please enter the audit reason for rejecting this listing so the executive can revise specs or images.
            </p>

            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing technical specs, blurry hero image, or pricing margin below category floor..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
