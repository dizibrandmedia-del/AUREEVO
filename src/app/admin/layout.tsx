"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  ShieldCheck,
  User,
  ChevronDown,
  Bell,
  Search,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
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

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 text-sm">
              AUREVO ERP Workspace
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
              Live Environment
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Role indicator & test switcher */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Current Role:</span>
              <select
                value={currentUser?.role || "SUPER_ADMIN"}
                onChange={(e) => switchRole(e.target.value)}
                className="font-bold text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
              >
                <option value="SUPER_ADMIN">👑 Super Admin</option>
                <option value="ADMIN_MANAGER">🛠️ Admin Manager</option>
                <option value="SALES_MANAGER">💼 Sales Manager</option>
                <option value="LISTING_EXECUTIVE">📝 Listing Executive</option>
              </select>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1 text-xs text-brand-blue hover:underline font-semibold"
            >
              Live Website <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
