"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";
import {
  LayoutDashboard,
  Package,
  CheckSquare,
  Upload,
  Layers,
  Building,
  TrendingUp,
  ShoppingCart,
  RotateCcw,
  Users,
  Tag,
  Calendar,
  ShieldCheck,
  FileSpreadsheet,
  ArrowLeft,
  Store,
} from "lucide-react";

const NAV_ITEMS = [
  {
    header: "Overview",
    items: [
      { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    header: "Catalog & Listings",
    items: [
      { name: "All Products", href: "/admin/catalog/products", icon: Package },
      { name: "Approval Workflow", href: "/admin/approval", icon: CheckSquare },
      { name: "Bulk CSV/Excel Upload", href: "/admin/bulk-upload", icon: Upload },
      { name: "Categories & Taxonomy", href: "/admin/catalog/categories", icon: Layers },
    ],
  },
  {
    header: "Supply Chain & Fulfilment",
    items: [
      { name: "Orders & Fulfilment", href: "/admin/orders", icon: ShoppingCart },
      { name: "Returns & Warranty Desk", href: "/admin/returns", icon: RotateCcw },
      { name: "Supplier Network", href: "/admin/suppliers", icon: Building },
      { name: "Pricing & Margin Engine", href: "/admin/pricing-margins", icon: TrendingUp },
    ],
  },
  {
    header: "Marketing & Security",
    items: [
      { name: "Coupons & Offers", href: "/admin/coupons", icon: Tag },
      { name: "Audit Trail & Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-dark text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-brand-gold/20 shadow-2xl">
      <div>
        {/* Logo */}
        <div className="p-5 border-b border-brand-gold/15 bg-brand-dark">
          <Logo variant="compact" badgeText="ERP" href="/admin" />
        </div>

        {/* Navigation List */}
        <div className="p-4 space-y-6 text-xs">
          {NAV_ITEMS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-brand-gold-dark font-luxury uppercase tracking-widest">
                {section.header}
              </span>
              <div className="space-y-1 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition ${
                        isActive
                          ? "bg-gold-gradient text-brand-dark font-black shadow-md hover:shadow-gold-glow"
                          : "hover:bg-brand-emerald/40 hover:text-brand-gold-light text-slate-300"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-dark" : "text-brand-gold/70"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Switcher */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Store className="w-4 h-4 text-brand-blue" />
          View Customer Storefront
        </Link>
        <Link
          href="/sales"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-brand-violet hover:bg-violet-950/40 transition"
        >
          <TrendingUp className="w-4 h-4" />
          Switch to Sales CRM →
        </Link>
      </div>
    </aside>
  );
}
