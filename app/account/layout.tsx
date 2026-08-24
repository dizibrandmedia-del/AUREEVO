'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.user) {
          setUser(data.data.user);
        } else {
          router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
        }
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 w-full space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { label: 'Clientèle Overview', href: '/account', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Personal Profile', href: '/account/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Saved Addresses', href: '/account/addresses', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Order History', href: '/account/orders', icon: <Package className="w-4 h-4" /> },
    { label: 'Private Wishlist', href: '/wishlist', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      {/* Account Hero Banner */}
      <section className="bg-luxury-card/30 border-b border-luxury-border/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-luxury-gold uppercase tracking-widest font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AUREEVO Clientèle Concierge</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-brand text-white">
              Welcome, {user.firstName} {user.lastName}
            </h1>
            <p className="text-xs text-luxury-muted font-mono">{user.email}</p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/40 text-xs text-luxury-gold-light font-semibold">
            Status: VIP Private Clientèle
          </div>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <div className="p-3 rounded-3xl bg-luxury-card/80 border border-luxury-border space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-luxury-gold text-luxury-darkest font-bold shadow-md shadow-luxury-gold/20'
                        : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
