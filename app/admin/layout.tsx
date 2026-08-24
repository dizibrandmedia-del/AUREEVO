'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { Header } from '@/components/admin/Header';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // For unauthenticated login/auth screens in /admin, do not render sidebar & header
  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  if (isAuthPage) {
    return <div className="min-h-screen bg-luxury-darkest">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:pl-64 overflow-x-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-3 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300 min-w-0 overflow-x-hidden">
          {children}
        </main>

        <footer className="py-4 sm:py-6 px-4 sm:px-8 border-t border-luxury-border/60 text-center text-[10px] sm:text-xs text-luxury-muted/70">
          <p>© {new Date().getFullYear()} AUREEVO — THE WORLD OF LUXURY. Enterprise Core Platform v1.0</p>
        </footer>
      </div>
    </div>
  );
}
