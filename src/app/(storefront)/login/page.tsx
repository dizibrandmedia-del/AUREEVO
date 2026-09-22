"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Package,
} from "lucide-react";
import Logo from "@/components/common/Logo";

interface CredentialPreset {
  roleName: string;
  badge: string;
  email: string;
  password: string;
  portal: string;
  portalName: string;
  icon: any;
  color: string;
}

const PRESETS: CredentialPreset[] = [
  {
    roleName: "Super Admin",
    badge: "SUPER_ADMIN",
    email: "admin@aureevo.com",
    password: "Admin@12345",
    portal: "/admin",
    portalName: "Admin ERP Portal",
    icon: ShieldCheck,
    color: "from-emerald-700 to-emerald-950 border-emerald-500/40 text-emerald-200",
  },
  {
    roleName: "Admin Manager",
    badge: "ADMIN_MANAGER",
    email: "manager@aureevo.com",
    password: "Manager@12345",
    portal: "/admin",
    portalName: "Admin ERP Portal",
    icon: Building2,
    color: "from-teal-800 to-slate-900 border-teal-500/40 text-teal-200",
  },
  {
    roleName: "Sales Manager",
    badge: "SALES_MANAGER",
    email: "sales@aureevo.com",
    password: "Sales@12345",
    portal: "/sales",
    portalName: "Sales CRM Portal",
    icon: Zap,
    color: "from-amber-700 to-amber-950 border-amber-500/40 text-amber-200",
  },
  {
    roleName: "Listing Executive",
    badge: "LISTING_EXECUTIVE",
    email: "listing@aureevo.com",
    password: "Listing@12345",
    portal: "/sales/listing",
    portalName: "Product Catalog & Listing",
    icon: Package,
    color: "from-cyan-800 to-slate-900 border-cyan-500/40 text-cyan-200",
  },
  {
    roleName: "Customer (VIP)",
    badge: "CUSTOMER",
    email: "customer@aureevo.com",
    password: "Customer@12345",
    portal: "/account",
    portalName: "Customer Account & Orders",
    icon: User,
    color: "from-slate-800 to-slate-950 border-slate-600/40 text-slate-200",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e?: React.FormEvent, customCreds?: { email: string; password: string; portal: string }) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const loginEmail = customCreds ? customCreds.email : email;
    const loginPassword = customCreds ? customCreds.password : password;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user?.name || "User"}! Redirecting...`);

      // Determine redirect destination
      let destination = "/";
      const userRole = data.user?.role;
      if (customCreds?.portal) {
        destination = customCreds.portal;
      } else if (userRole === "SUPER_ADMIN" || userRole === "ADMIN_MANAGER") {
        destination = "/admin";
      } else if (userRole === "SALES_MANAGER" || userRole === "LISTING_EXECUTIVE") {
        destination = "/sales";
      } else if (userRole === "CUSTOMER") {
        destination = "/account";
      }

      setTimeout(() => {
        window.location.href = destination;
      }, 700);
    } catch (err: any) {
      setErrorMessage("Network error. Could not connect to authentication server.");
      setLoading(false);
    }
  };

  const handleQuickLogin = (preset: CredentialPreset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    handleLogin(undefined, { email: preset.email, password: preset.password, portal: preset.portal });
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-brand-bg via-slate-50 to-brand-bg py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-luxury">
            AUREVO Portal Authentication
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to access your administrative dashboard, sales workstation, or customer account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Login Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-border/60 relative">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold">
                <Lock className="w-4 h-4 text-brand-emerald" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Account Sign In</h2>
                <p className="text-xs text-slate-500">Enter your official credentials</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@aureevo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Default: Role@12345</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-emerald via-emerald-800 to-brand-dark text-brand-gold-light hover:text-white font-bold text-sm tracking-wide shadow-md hover:shadow-gold-glow border border-brand-gold/30 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-gold-light border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/" className="hover:text-brand-emerald font-semibold transition">
                ← Back to Storefront
              </Link>
              <Link href="/track-order" className="hover:text-brand-emerald transition">
                Track Order
              </Link>
            </div>
          </div>

          {/* Quick-Fill Demo Cards for All Roles */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-gold-dark" />
                  <span>Configured Role Credentials</span>
                </h3>
                <p className="text-[11px] text-slate-500">Click any card below to auto-fill & login instantly</p>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live & Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.roleName}
                    type="button"
                    onClick={() => handleQuickLogin(preset)}
                    className="w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-gold/60 hover:shadow-md transition group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center shadow-xs border`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-brand-emerald transition">
                              {preset.roleName}
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {preset.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {preset.email} • <span className="text-slate-700 font-semibold">{preset.password}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-brand-emerald shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                        <span>Login</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Dual-Domain Enabled:</span> You can also login with the{" "}
                <span className="font-mono font-semibold">@aurevo.digital</span> alias for all staff roles (e.g.{" "}
                <span className="font-mono">admin@aurevo.digital</span>).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
