import React from "react";

export default function StorefrontLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-pulse">
      {/* 1. Category Story Circles Skeleton */}
      <div className="flex items-center gap-4 overflow-x-hidden py-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-200/80 border border-slate-300/40" />
            <div className="w-12 h-2.5 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* 2. Hero Banner Skeleton */}
      <div className="w-full h-52 sm:h-80 md:h-96 rounded-3xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border border-slate-300/40 shadow-sm" />

      {/* 3. Category Grid 2x4 Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 sm:h-44 rounded-2xl bg-slate-200/70 border border-slate-300/30" />
        ))}
      </div>

      {/* 4. Product Cards Grid Skeleton */}
      <div className="space-y-4">
        <div className="w-48 h-6 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
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
  );
}
