'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Shield,
  Building2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/ToastContext';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdminUser(data.data.admin);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' });
      if (res.ok) {
        success('Logged out successfully');
        router.push('/admin/login');
        router.refresh();
      }
    } catch {
      error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-luxury-darkest/90 border-b border-luxury-border/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Hamburger & Page breadcrumb indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-luxury-muted hover:text-white hover:bg-luxury-surface/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-luxury-muted">
          <span className="font-semibold text-luxury-gold tracking-widest uppercase">AUREEVO</span>
          <span>/</span>
          <span className="text-white">Admin Management Suite</span>
        </div>
      </div>

      {/* Right side: Global Actions & User Profile */}
      <div className="flex items-center gap-4">
        {/* Active Warehouse Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-luxury-emerald/60 border border-luxury-border text-xs text-luxury-muted">
          <Building2 className="w-3.5 h-3.5 text-luxury-gold" />
          <span className="text-white font-medium">Mumbai Fulfillment Hub</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Notifications Icon Placeholder */}
        <button
          className="relative p-2 rounded-xl text-luxury-muted hover:text-white hover:bg-luxury-surface/50 transition-colors"
          title="System notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-luxury-gold"></span>
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-luxury-surface/40 transition-colors border border-transparent hover:border-luxury-border"
          >
            <div className="w-9 h-9 rounded-xl bg-luxury-emerald/80 border border-luxury-gold/50 flex items-center justify-center text-luxury-gold font-bold text-xs shadow-md">
              {adminUser?.avatar ? (
                <img
                  src={adminUser.avatar}
                  alt={adminUser.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                adminUser?.name?.charAt(0) || 'A'
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white tracking-wide leading-tight">
                {adminUser?.name || 'Administrator'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-luxury-gold-light uppercase tracking-wider font-medium">
                  {adminUser?.roleName || 'Super Admin'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-luxury-muted hidden md:block" />
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-luxury-darkest/95 border border-luxury-border rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-luxury-border/70">
                  <p className="text-xs font-semibold text-white truncate">{adminUser?.name}</p>
                  <p className="text-[11px] text-luxury-muted truncate">{adminUser?.email}</p>
                  <div className="mt-2">
                    <Badge variant="gold" size="sm">
                      {adminUser?.roleName || 'Super Admin'}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/admin/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-luxury-muted hover:text-white hover:bg-luxury-surface/50 rounded-xl transition-colors text-left"
                  >
                    <Shield className="w-4 h-4 text-luxury-gold" />
                    <span>Security & Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors text-left mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
