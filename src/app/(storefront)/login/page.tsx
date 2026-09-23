"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  LogIn,
  Sparkles,
} from "lucide-react";
import Logo from "../../../components/common/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleTabChange = (tab: "SIGNIN" | "SIGNUP") => {
    setActiveTab(tab);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Sign In Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user?.name || "User"}! Redirecting...`);

      // Role-based redirection
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
      }, 600);
    } catch (err: any) {
      setErrorMessage("Network error. Could not connect to authentication server.");
      setLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          phone: signupPhone.trim(),
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMessage(`Account created! Welcome to AUREVO, ${data.user?.name || "Member"}. Redirecting...`);

      setTimeout(() => {
        window.location.href = "/account";
      }, 700);
    } catch (err: any) {
      setErrorMessage("Network error. Could not create account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-brand-bg via-slate-50 to-brand-bg py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-luxury">
            {activeTab === "SIGNIN" ? "Sign In to AUREVO" : "Join AUREVO Luxury"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            {activeTab === "SIGNIN"
              ? "Access your orders, concierge benefits, or management workstation"
              : "Create your VIP customer account to enjoy genuine warranties & fast checkout"}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl mb-4 border border-slate-300/60 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange("SIGNIN")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "SIGNIN"
                ? "bg-white text-brand-dark shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("SIGNUP")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "SIGNUP"
                ? "bg-brand-emerald text-brand-gold-light shadow-sm font-extrabold border border-brand-gold/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-border/60 relative">
          {/* Card Header Tag */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center font-bold">
                {activeTab === "SIGNIN" ? (
                  <Lock className="w-4 h-4 text-brand-emerald" />
                ) : (
                  <Sparkles className="w-4 h-4 text-brand-gold-dark" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {activeTab === "SIGNIN" ? "Account Sign In" : "New Customer Registration"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {activeTab === "SIGNIN"
                    ? "Enter your registered credentials"
                    : "Fill in your details to register with email"}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {activeTab === "SIGNIN" ? "Direct Access" : "VIP Member"}
            </span>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === "SIGNIN" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("SIGNUP")}
                  className="text-xs text-slate-600 hover:text-brand-emerald transition font-medium"
                >
                  Don't have an account?{" "}
                  <span className="font-bold text-brand-emerald underline">Sign Up with Email</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Phone
                  </label>
                  <span className="text-[10px] text-slate-400">For delivery updates</span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-slate-50/50"
                  />
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
                    <UserPlus className="w-4 h-4" />
                    <span>Create VIP Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleTabChange("SIGNIN")}
                  className="text-xs text-slate-600 hover:text-brand-emerald transition font-medium"
                >
                  Already have an account?{" "}
                  <span className="font-bold text-brand-emerald underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-emerald font-semibold transition">
              ← Back to Storefront
            </Link>
            <Link href="/track-order" className="hover:text-brand-emerald transition">
              Track Order Status
            </Link>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            <span>256-bit SSL Encrypted Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
