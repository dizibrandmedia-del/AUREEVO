"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Percent,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState("PERCENTAGE");
  const [formValue, setFormValue] = useState("10");
  const [formMinOrder, setFormMinOrder] = useState("5000");
  const [formMaxCap, setFormMaxCap] = useState("3000");
  const [formUsageLimit, setFormUsageLimit] = useState("1000");
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<CouponItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormError("");

    setFormCode("");
    setFormDesc("");
    setFormType("PERCENTAGE");
    setFormValue("10");
    setFormMinOrder("5000");
    setFormMaxCap("3000");
    setFormUsageLimit("1000");
    // Default expiry 60 days in future
    const future = new Date();
    future.setDate(future.getDate() + 60);
    setFormEndDate(future.toISOString().split("T")[0]);
    setFormIsActive(true);

    setModalOpen(true);
  };

  const handleOpenEditModal = (c: CouponItem) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFormError("");

    setFormCode(c.code);
    setFormDesc(c.description || "");
    setFormType(c.discountType);
    setFormValue(c.discountValue.toString());
    setFormMinOrder(c.minOrderAmount?.toString() || "0");
    setFormMaxCap(c.maxDiscountAmount ? c.maxDiscountAmount.toString() : "");
    setFormUsageLimit(c.usageLimit?.toString() || "1000");
    setFormEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
    setFormIsActive(c.isActive);

    setModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formCode.trim() || !formValue || !formEndDate) {
      setFormError("Coupon code, discount value, and valid until date are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        // PUT
        const res = await fetch("/api/v1/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            code: formCode.trim().toUpperCase(),
            description: formDesc.trim() || undefined,
            discountType: formType,
            discountValue: formValue,
            minOrderAmount: formMinOrder,
            maxDiscountAmount: formMaxCap || undefined,
            usageLimit: formUsageLimit,
            endDate: formEndDate,
            isActive: formIsActive,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          setSuccessToast("Coupon updated successfully!");
          loadCoupons();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          setFormError(data.error || "Update failed.");
        }
      } else {
        // POST
        const res = await fetch("/api/v1/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: formCode.trim().toUpperCase(),
            description: formDesc.trim() || undefined,
            discountType: formType,
            discountValue: formValue,
            minOrderAmount: formMinOrder,
            maxDiscountAmount: formMaxCap || undefined,
            usageLimit: formUsageLimit,
            endDate: formEndDate,
            isActive: formIsActive,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          setSuccessToast("New coupon created successfully!");
          loadCoupons();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          setFormError(data.error || "Creation failed.");
        }
      }
    } catch (err) {
      setFormError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (c: CouponItem) => {
    try {
      const res = await fetch("/api/v1/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: c.id,
          isActive: !c.isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, isActive: !item.isActive } : item))
        );
        setSuccessToast(`Coupon ${c.code} is now ${!c.isActive ? "ACTIVE" : "PAUSED"}`);
        setTimeout(() => setSuccessToast(""), 2500);
      }
    } catch (err) {
      alert("Failed to toggle coupon.");
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/coupons?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        setSuccessToast(`Coupon ${deleteTarget.code} deleted.`);
        loadCoupons();
        setTimeout(() => setSuccessToast(""), 3000);
      } else {
        alert(data.error || "Delete failed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark border border-brand-gold text-brand-gold-light px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark font-luxury">
            Promotional Coupons &amp; Festival Discounts ({coupons.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage discount codes, minimum order value gates, and maximum savings ceilings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCoupons}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-xs shadow-md hover:shadow-gold-glow transition uppercase font-luxury tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Create New Coupon
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
            Loading promotional coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border">
            No coupons found. Click "+ Create New Coupon" above to launch a campaign discount.
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className={`bg-white p-6 rounded-3xl border shadow-sm space-y-3 text-xs transition ${
                c.isActive ? "border-brand-gold/30 hover:border-brand-gold" : "border-slate-200 opacity-60"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 bg-brand-dark text-brand-gold-light border border-brand-gold/40 font-mono font-black rounded-xl tracking-wider text-xs shadow-sm">
                  {c.code}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(c)}
                    title={c.isActive ? "Click to Pause" : "Click to Activate"}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                      c.isActive
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {c.isActive ? "ACTIVE" : "PAUSED"}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-dark transition"
                    title="Edit Coupon"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="font-bold text-slate-900 text-sm line-clamp-1">{c.description}</p>

              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex justify-between items-center">
                  <span>Discount:</span>
                  <strong className="text-emerald-700 font-black text-xs font-luxury">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}% Off` : `Flat ₹${c.discountValue.toLocaleString()}`}
                  </strong>
                </p>

                <p className="flex justify-between items-center">
                  <span>Min Order Value:</span>
                  <strong>₹{c.minOrderAmount.toLocaleString()}</strong>
                </p>

                {c.maxDiscountAmount && (
                  <p className="flex justify-between items-center">
                    <span>Max Discount Cap:</span>
                    <strong>₹{c.maxDiscountAmount.toLocaleString()}</strong>
                  </p>
                )}

                <p className="flex justify-between items-center text-slate-400">
                  <span>Redemptions:</span>
                  <span>{c.usageCount} / {c.usageLimit}</span>
                </p>

                <p className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1 border-t border-slate-50">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  Valid through {new Date(c.endDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden">
            <div className="bg-gradient-to-r from-brand-dark to-brand-emerald text-white p-5 flex items-center justify-between border-b border-brand-gold/30">
              <h3 className="text-base font-black font-luxury">
                {isEditing ? "Edit Promotional Coupon" : "Create New Coupon"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campaign Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Special 10% instant discount on luxury TVs and ACs"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === "PERCENTAGE" ? "10" : "2000"}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formMaxCap}
                    onChange={(e) => setFormMaxCap(e.target.value)}
                    placeholder="e.g. 5000 (optional)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Total Uses</label>
                  <input
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-emerald focus:ring-brand-gold"
                  />
                  <span className="font-semibold text-slate-700">Coupon is Active for Storefront Checkout</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl shadow-md hover:shadow-gold-glow uppercase font-luxury tracking-wider disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isEditing ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-luxury">Confirm Coupon Deletion</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete coupon <strong>{deleteTarget.code}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCoupon}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
