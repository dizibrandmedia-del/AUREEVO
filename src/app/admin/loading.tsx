import React from "react";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-slate-200 rounded-xl" />
          <div className="w-72 h-4 bg-slate-100 rounded" />
        </div>
        <div className="w-32 h-10 bg-slate-200 rounded-xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="w-24 h-4 bg-slate-200 rounded" />
            <div className="w-36 h-7 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-48 h-9 bg-slate-100 rounded-lg" />
          <div className="w-32 h-9 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 gap-4">
              <div className="w-12 h-4 bg-slate-200 rounded" />
              <div className="w-40 h-4 bg-slate-200 rounded" />
              <div className="w-24 h-4 bg-slate-100 rounded" />
              <div className="flex-1" />
              <div className="w-16 h-4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
