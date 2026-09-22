"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  DollarSign,
  ShieldAlert,
} from "lucide-react";

export default function PricingMarginsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const loadMargins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/pricing/margins");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMargins();
  }, []);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      const res = await fetch("/api/v1/pricing/margins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRule),
      });

      const data = await res.json();
      if (data.success) {
        setSaveMessage(data.message);
        setEditingRule(null);
        loadMargins();
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      alert("Failed to update margin rule.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Pricing & Margin Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: Selling Price – Purchase Cost – Other Costs (Packaging, Logistics, Gateway) = Net Margin
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-brand-violet">
          Role Protected: Super Admin & Admin Manager Only
        </span>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveMessage}
        </div>
      )}

      {/* Category Margins Table */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div
            key={cat.categoryId}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {cat.categoryName} ({cat.productCount} SKUs)
                </h3>
                <p className="text-slate-500">
                  Default Target Margin: <strong>{cat.rule?.defaultMarginPercent || 15}%</strong> • Min Floor:{" "}
                  <strong>{cat.rule?.minMarginPercent || 10}%</strong> • Other Costs:{" "}
                  <strong>{cat.rule?.otherCostPercent || 3}%</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Avg Net Margin</span>
                  <p className="font-black text-sm text-brand-violet">{cat.avgNetMarginPercent}%</p>
                </div>
                <button
                  onClick={() =>
                    setEditingRule({
                      categoryId: cat.categoryId,
                      categoryName: cat.categoryName,
                      minMarginPercent: cat.rule?.minMarginPercent || 10,
                      defaultMarginPercent: cat.rule?.defaultMarginPercent || 15,
                      otherCostPercent: cat.rule?.otherCostPercent || 3,
                    })
                  }
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Configure Category Rules"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Item Margins */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Purchase Cost</th>
                    <th className="pb-2">Selling Price</th>
                    <th className="pb-2">Gross Margin</th>
                    <th className="pb-2">Other Costs</th>
                    <th className="pb-2">Net Margin</th>
                    <th className="pb-2">Margin %</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cat.products?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-semibold text-slate-900 line-clamp-1 max-w-xs">
                        {p.name}
                      </td>
                      <td className="py-2.5 text-slate-600 font-bold">
                        ₹{p.purchaseCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-slate-900 font-extrabold">
                        ₹{p.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-slate-700">
                        ₹{p.grossMarginAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-slate-400">
                        ₹{p.otherCostAmount.toLocaleString()} ({p.otherCostPercent}%)
                      </td>
                      <td className="py-2.5 font-bold text-emerald-700">
                        ₹{p.netMarginAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 font-black text-brand-violet">
                        {p.netMarginPercent}%
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.alertLevel === "HEALTHY"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.alertLevel === "MODERATE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.alertLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-dropdown border border-slate-100 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Configure Margin Rule: {editingRule.categoryName}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Target Margin %
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editingRule.defaultMarginPercent}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, defaultMarginPercent: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Floor Margin % (Alert Trigger)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editingRule.minMarginPercent}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, minMarginPercent: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Other Costs Overhead % (Packaging, Gateway, Local Courier)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editingRule.otherCostPercent}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, otherCostPercent: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Save Margin Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
