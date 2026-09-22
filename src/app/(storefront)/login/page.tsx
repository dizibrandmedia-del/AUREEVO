"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/common/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user?.name || "User"}! Redirecting...`);

      // Determine redirect destination based on authenticated role
      let destination = "/";
      const userRole = data.user?.role;
      if (userRole === "SUPER_ADMIN" || userRole === "ADMIN_MANAGER") {
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

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-brand-bg via-slate-50 to-brand-bg py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-luxury">
            Sign In to AUREVO
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Access your orders, concierge benefits, or management workstation
          </p>
        </div>

        {/* Centered Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-border/60 relative">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold">
              <Lock className="w-4 h-4 text-brand-emerald" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Secure Sign In</h2>
              <p className="text-xs text-slate-500">Enter your registered email and password</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
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
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  <span>Sign In</span>
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
              Track Order Status
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            <span>256-bit SSL Encrypted Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
