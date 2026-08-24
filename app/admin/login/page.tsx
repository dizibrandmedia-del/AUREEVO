'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [email, setEmail] = useState('admin@aureevo.com');
  const [password, setPassword] = useState('Admin@123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        success('Welcome back', `Authenticated as ${data.data.admin.name}`);
        router.push('/admin');
        router.refresh();
      } else {
        error(data.error || 'Authentication failed');
      }
    } catch {
      error('Network error during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkest flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-luxury-emerald/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-luxury-gold/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Main Card */}
        <div className="bg-luxury-card/90 border border-luxury-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />

          {/* Official Logo & Branding */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/70 shadow-xl shadow-luxury-gold/15 flex items-center justify-center overflow-hidden">
              <img
                src="/images/aureevo-logo.png"
                alt="AUREEVO Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold font-brand tracking-widest text-white">
              AUREEVO
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold-light font-medium mt-1">
              THE WORLD OF LUXURY
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-emerald/50 border border-luxury-border text-[11px] text-luxury-muted mt-3">
              <Shield className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Admin Management Portal</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@aureevo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-luxury-muted">Enterprise RBAC Guarded</span>
              <Link
                href="/admin/forgot-password"
                className="text-luxury-gold-light hover:text-luxury-gold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Admin Portal
            </Button>
          </form>

          {/* Demo credential helper */}
          <div className="mt-8 pt-6 border-t border-luxury-border/60 text-center">
            <p className="text-[11px] text-luxury-muted">
              Demo Super Admin: <span className="text-white font-mono">admin@aureevo.com</span> /{' '}
              <span className="text-white font-mono">Admin@123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
