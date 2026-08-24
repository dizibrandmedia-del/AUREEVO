'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Sliders,
  Boxes,
  Warehouse as WarehouseIcon,
  Users,
  ShieldCheck,
  History,
  FileSpreadsheet,
  Settings,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  UserCheck,
  Megaphone,
  BarChart3,
  Globe,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isPhase1?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core Engine',
    items: [
      { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, isPhase1: true },
    ],
  },
  {
    title: 'Catalogue Architecture',
    items: [
      { name: 'Products', href: '/admin/products', icon: <Package className="w-4 h-4" />, isPhase1: true },
      { name: 'Categories', href: '/admin/categories', icon: <Layers className="w-4 h-4" />, isPhase1: true },
      { name: 'Brands', href: '/admin/brands', icon: <Sparkles className="w-4 h-4" />, isPhase1: true },
      { name: 'Attributes', href: '/admin/attributes', icon: <Sliders className="w-4 h-4" />, isPhase1: true },
    ],
  },
  {
    title: 'Inventory & Warehousing',
    items: [
      { name: 'Stock Matrix', href: '/admin/inventory', icon: <Boxes className="w-4 h-4" />, isPhase1: true },
      { name: 'Stock History', href: '/admin/inventory/history', icon: <History className="w-4 h-4" />, isPhase1: true },
      { name: 'Warehouses', href: '/admin/warehouses', icon: <WarehouseIcon className="w-4 h-4" />, isPhase1: true },
    ],
  },
  {
    title: 'Media & Operations',
    items: [
      { name: 'Media Library', href: '/admin/media', icon: <ImageIcon className="w-4 h-4" />, isPhase1: true },
      { name: 'Import / Export', href: '/admin/import-export', icon: <FileSpreadsheet className="w-4 h-4" />, isPhase1: true },
      { name: 'Activity Logs', href: '/admin/activity-logs', icon: <History className="w-4 h-4" />, isPhase1: true },
    ],
  },
  {
    title: 'Commerce & Orders',
    items: [
      { name: 'Orders Queue', href: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" />, isPhase1: true },
      { name: 'Clientele CRM', href: '/admin/customers', icon: <Users className="w-4 h-4" />, isPhase1: true },
      { name: 'Returns & Refunds', href: '/admin/returns', icon: <History className="w-4 h-4" />, isPhase1: true },
      { name: 'Privilege Vouchers', href: '/admin/coupons', icon: <Megaphone className="w-4 h-4" />, isPhase1: true },
      { name: 'Commerce Reports', href: '/admin/reports', icon: <BarChart3 className="w-4 h-4" />, isPhase1: true },
    ],
  },
  {
    title: 'Storefront & Growth',
    items: [
      { name: 'Homepage CMS', href: '/admin/cms', icon: <FileText className="w-4 h-4" />, isPhase1: true },
      { name: 'SEO & Indexing', href: '/admin/seo', icon: <Globe className="w-4 h-4" />, isPhase1: true },
      { name: 'Marketing & Pixels', href: '/admin/marketing', icon: <Sparkles className="w-4 h-4" />, isPhase1: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Admin Users', href: '/admin/users', icon: <Users className="w-4 h-4" />, isPhase1: true },
      { name: 'Roles & RBAC', href: '/admin/roles', icon: <ShieldCheck className="w-4 h-4" />, isPhase1: true },
      { name: 'Store Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" />, isPhase1: true },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-40 w-64 bg-luxury-darkest/95 border-r border-luxury-border/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header with Official Logo */}
        <div className="h-20 flex items-center px-5 border-b border-luxury-border/80 bg-luxury-emerald/20">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden shadow-lg shadow-luxury-gold/10 group-hover:border-luxury-gold transition-colors shrink-0">
              <img
                src="/images/aureevo-logo.png"
                alt="AUREEVO Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-bold font-brand tracking-widest text-white">
                AUREEVO
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-luxury-gold-light font-medium">
                THE WORLD OF LUXURY
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-luxury-muted/70 mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                if (!item.isPhase1) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 text-xs text-luxury-muted/40 rounded-xl cursor-not-allowed select-none group"
                      title="Available in upcoming Phase"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="opacity-40">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-luxury-surface/30 text-luxury-muted/50 border border-luxury-border/30">
                        {item.badge}
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-luxury-emerald via-luxury-surface/80 to-luxury-emerald/60 text-luxury-gold-light border border-luxury-gold/40 shadow-md shadow-luxury-gold/5 font-semibold'
                        : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/40'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-luxury-gold' : 'group-hover:text-luxury-gold-light'
                        )}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-luxury-gold" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info & Store link */}
        <div className="p-3 border-t border-luxury-border/80 bg-luxury-emerald/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-luxury-gold-light/80 hover:text-luxury-gold hover:bg-luxury-emerald/40 transition-colors border border-luxury-gold/20"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-luxury-gold">Live</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
