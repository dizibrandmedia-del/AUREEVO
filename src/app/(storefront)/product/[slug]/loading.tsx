import React from "react";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-12 h-3 bg-slate-200 rounded" />
        <div className="w-3 h-3 bg-slate-200 rounded" />
        <div className="w-20 h-3 bg-slate-200 rounded" />
        <div className="w-3 h-3 bg-slate-200 rounded" />
        <div className="w-32 h-3 bg-slate-200 rounded" />
      </div>

      {/* Product Detail Two-Column Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery Skeleton */}
        <div className="space-y-4">
          <div className="w-full aspect-square rounded-3xl bg-slate-200 border border-slate-300/40" />
          <div className="flex items-center gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
            ))}
          </div>
        </div>

        {/* Right: Info & Purchase Skeleton */}
        <div className="space-y-5">
          <div className="w-28 h-6 bg-amber-100 rounded-full" />
          <div className="w-full h-10 bg-slate-200 rounded-xl" />
          <div className="w-2/3 h-5 bg-slate-200 rounded" />
          <div className="flex items-center gap-3 pt-2">
            <div className="w-36 h-9 bg-slate-200 rounded-lg" />
            <div className="w-24 h-6 bg-slate-100 rounded" />
            <div className="w-20 h-6 bg-emerald-100 rounded-full" />
          </div>

          <div className="h-16 rounded-2xl bg-amber-50/60 border border-amber-200/50 p-4" />

          {/* Action Buttons Skeleton */}
          <div className="flex gap-4 pt-4">
            <div className="flex-1 h-14 rounded-2xl bg-slate-200" />
            <div className="flex-1 h-14 rounded-2xl bg-slate-200" />
          </div>

          {/* Highlights Box Skeleton */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="w-40 h-4 bg-slate-200 rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-3 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
