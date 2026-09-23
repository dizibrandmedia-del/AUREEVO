import React from "react";

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-12 h-3 bg-slate-200 rounded" />
        <div className="w-3 h-3 bg-slate-200 rounded" />
        <div className="w-24 h-3 bg-slate-200 rounded" />
      </div>

      {/* Category Header Banner Skeleton */}
      <div className="w-full h-36 sm:h-44 rounded-3xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border border-slate-300/40 p-6 flex flex-col justify-center space-y-3">
        <div className="w-48 sm:w-64 h-8 bg-slate-300/70 rounded-xl" />
        <div className="w-72 sm:w-96 h-4 bg-slate-300/50 rounded-lg" />
      </div>

      {/* Subcategory Pills Skeleton */}
      <div className="flex items-center gap-2 overflow-x-hidden py-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-24 h-8 bg-slate-200 rounded-full shrink-0" />
        ))}
      </div>

      {/* Main Content Layout: Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar Skeleton */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="h-64 bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <div className="w-20 h-4 bg-slate-200 rounded" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-200" />
                  <div className="w-28 h-3 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3 sm:p-4 space-y-3 shadow-sm"
              >
                <div className="w-full aspect-square rounded-xl bg-slate-100" />
                <div className="w-3/4 h-3.5 bg-slate-200 rounded" />
                <div className="w-1/2 h-3 bg-slate-100 rounded" />
                <div className="flex items-center justify-between pt-2">
                  <div className="w-20 h-5 bg-slate-200 rounded" />
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
