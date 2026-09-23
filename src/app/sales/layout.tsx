"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";
import {
  TrendingUp,
  Users,
  FileText,
  PlusSquare,
  Building,
  Store,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        } else {
          fetch("/api/v1/auth/quick-switch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetRole: "SALES_MANAGER" }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) setCurrentUser(d.user);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const switchRole = async (targetRole: string) => {
    const res = await fetch("/api/v1/auth/quick-switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole }),
    });
    const data = await res.json();
    if (data.success) {
      setCurrentUser(data.user);
      window.location.reload();
    }
  };

  const navLinks = [
    { name: "Sales Dashboard", href: "/sales", icon: TrendingUp },
    { name: "Lead Pipeline CRM", href: "/sales/leads", icon: Users },
    { name: "Quotations Desk", href: "/sales/quotations", icon: FileText },
    { name: "Product Listing Desk", href: "/sales/listing", icon: PlusSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      {/* Top Navigation Bar */}
      <header className="bg-brand-dark text-white border-b border-brand-gold/20 px-6 py-3 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo variant="compact" badgeText="SALES" href="/sales" />

            {/* Navigation Links */}
            <nav className="flex items-center gap-1.5 text-xs">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                      isActive
                        ? "bg-gold-gradient text-brand-dark font-black shadow-md hover:shadow-gold-glow"
                        : "text-slate-300 hover:text-brand-gold-light hover:bg-brand-emerald/40"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-dark" : "text-brand-gold/70"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sales Role:</span>
              <select
                value={currentUser?.role || "SALES_MANAGER"}
                onChange={(e) => switchRole(e.target.value)}
                className="font-bold text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none"
              >
                <option value="SALES_MANAGER">💼 Sales Manager</option>
                <option value="LISTING_EXECUTIVE">📝 Listing Executive</option>
                <option value="SUPER_ADMIN">👑 Super Admin</option>
              </select>
            </div>

            <Link
              href="/admin"
              className="text-xs text-brand-blue hover:underline font-semibold"
            >
              Admin ERP →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto p-6 sm:p-8 flex-1">
        {children}
      </main>
    </div>
  );
}
