'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  MapPin,
  Package,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function AccountOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/account/profile').then((r) => r.json()),
      fetch('/api/account/addresses').then((r) => r.json()),
    ]).then(([profRes, addrRes]) => {
      if (profRes.success) setProfile(profRes.data.user);
      if (addrRes.success) setAddresses(addrRes.data.addresses);
    });
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-luxury-emerald via-luxury-card to-luxury-darkest border border-luxury-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Private Salon Privilege</span>
          </span>
          <h2 className="text-xl sm:text-3xl font-bold font-brand text-white">
            Clientèle Concierge Portal
          </h2>
          <p className="text-xs text-luxury-muted max-w-md leading-relaxed">
            Manage your personal consultations, verified delivery locations, and private formulation wishlist.
          </p>
        </div>

        <Link href="/shop">
          <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Haute Releases
          </Button>
        </Link>
      </div>

      {/* Grid of Profile & Default Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-luxury-gold" />
              <h3 className="text-sm font-bold font-brand text-white">Personal Profile</h3>
            </div>
            <Link href="/account/profile" className="text-xs text-luxury-gold-light hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-luxury-muted block">Full Name:</span>
              <span className="font-semibold text-white">
                {profile?.firstName} {profile?.lastName}
              </span>
            </div>
            <div>
              <span className="text-luxury-muted block">Email Address:</span>
              <span className="font-mono text-white">{profile?.email}</span>
            </div>
            <div>
              <span className="text-luxury-muted block">Phone Number:</span>
              <span className="text-white">{profile?.phone || 'Not specified'}</span>
            </div>
          </div>
        </Card>

        {/* Default Delivery Address Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-luxury-gold" />
              <h3 className="text-sm font-bold font-brand text-white">Primary Delivery Location</h3>
            </div>
            <Link href="/account/addresses" className="text-xs text-luxury-gold-light hover:underline font-semibold">
              Manage
            </Link>
          </div>

          {defaultAddress ? (
            <div className="space-y-1.5 text-xs text-luxury-muted">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{defaultAddress.name}</span>
                <Badge variant="gold" size="sm">
                  {defaultAddress.addressType}
                </Badge>
              </div>
              <p className="text-white">
                {defaultAddress.addressLine1}
                {defaultAddress.addressLine2 && `, ${defaultAddress.addressLine2}`}
              </p>
              <p>
                {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
              </p>
              <p className="font-mono">Contact: {defaultAddress.phone}</p>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-luxury-muted">No saved addresses yet.</p>
              <Link href="/account/addresses">
                <Button variant="outline" size="sm">
                  + Add Address
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/account/orders" className="block group">
          <Card className="p-5 hover:border-luxury-gold/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-luxury-surface/60 text-luxury-gold border border-luxury-border">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-luxury-gold-light">
                  Order Tracking
                </h4>
                <p className="text-[11px] text-luxury-muted">View status of shipments</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/wishlist" className="block group">
          <Card className="p-5 hover:border-luxury-gold/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-luxury-surface/60 text-luxury-gold border border-luxury-border">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-luxury-gold-light">
                  Private Wishlist
                </h4>
                <p className="text-[11px] text-luxury-muted">Saved creations</p>
              </div>
            </div>
          </Card>
        </Link>

        <a
          href="https://wa.me/912289001200"
          target="_blank"
          rel="noreferrer"
          className="block group"
        >
          <Card className="p-5 hover:border-luxury-gold/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-luxury-emerald/60 text-luxury-gold border border-luxury-gold/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-luxury-gold-light">
                  VIP WhatsApp
                </h4>
                <p className="text-[11px] text-luxury-muted">Instant concierge line</p>
              </div>
            </div>
          </Card>
        </a>
      </div>
    </div>
  );
}
