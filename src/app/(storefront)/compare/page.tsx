"use client";

import React from "react";
import Link from "next/link";
import { useCompareStore, useCartStore } from "@/lib/store";
import {
  Layers,
  X,
  ShoppingCart,
  Star,
  ShieldCheck,
  Wrench,
  Truck,
  ArrowRight,
} from "lucide-react";

export default function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30 flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8 text-brand-gold" />
        </div>
        <h1 className="text-2xl font-bold text-brand-dark font-luxury">Your Comparison Matrix is Empty</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You can compare up to 4 appliances or electronics side-by-side to review specs, warranties, energy ratings, and pricing.
        </p>
        <Link
          href="/category/electronics"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-xs uppercase font-luxury tracking-wider shadow-md hover:shadow-gold-glow transition"
        >
          Browse Products to Compare <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Extract all unique attribute names across compared products
  const attributeNames = Array.from(
    new Set(
      items.flatMap((prod) =>
        (prod.attributes || []).map((a: any) => a.attributeName)
      )
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-violet" />
            Product Comparison ({items.length}/4)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side technical specs, pricing, and warranty analysis
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="text-xs font-semibold text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
        >
          Clear Comparison
        </button>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-4 text-left font-bold text-slate-400 uppercase tracking-wider w-48 bg-slate-50">
                Products
              </th>
              {items.map((prod) => (
                <th key={prod.id} className="p-4 text-left align-top min-w-[220px]">
                  <div className="relative space-y-3">
                    <button
                      onClick={() => toggleCompare(prod)}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="w-32 h-32 mx-auto rounded-xl bg-slate-50 p-2">
                      <img
                        src={
                          prod.images?.[0]?.url ||
                          (typeof prod.images?.[0] === "string" ? prod.images[0] : "") ||
                          "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
                        }
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-blue">
                        {prod.brand?.name}
                      </span>
                      <h4 className="font-semibold text-slate-900 line-clamp-2 mt-0.5">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{prod.sellingPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{prod.mrp.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => addItem(prod, 1)}
                      className="w-full py-2 bg-brand-blue text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Warranty */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50">Brand Warranty</td>
              {items.map((prod) => (
                <td key={prod.id} className="p-4 font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {prod.warrantyMonths ? `${prod.warrantyMonths / 12} Years` : "1 Year Standard"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Installation */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50">Installation</td>
              {items.map((prod) => (
                <td key={prod.id} className="p-4 font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-brand-violet" />
                    {prod.installationType === "FREE" ? "Free Installation" : "Self / Paid Demo"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Delivery */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50">Doorstep Delivery</td>
              {items.map((prod) => (
                <td key={prod.id} className="p-4 font-bold text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Free Express Delivery
                  </span>
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50">Customer Rating</td>
              {items.map((prod) => (
                <td key={prod.id} className="p-4 font-bold text-amber-600">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.8 / 5.0
                  </span>
                </td>
              ))}
            </tr>

            {/* Technical Specifications */}
            {attributeNames.map((attrName) => (
              <tr key={attrName}>
                <td className="p-4 font-semibold text-slate-500 bg-slate-50">{attrName}</td>
                {items.map((prod) => {
                  const match = (prod.attributes || []).find(
                    (a: any) => a.attributeName === attrName
                  );
                  return (
                    <td key={prod.id} className="p-4 text-slate-700 font-medium">
                      {match ? match.attributeValue : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
