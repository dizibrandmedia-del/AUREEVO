'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  CheckCircle2,
  Package,
  Truck,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Analytics } from '@/lib/analytics';

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.order) {
          const ord = data.data.order;
          setOrder(ord);

          // Fire Analytics Purchase
          Analytics.purchase({
            orderNumber: ord.orderNumber,
            grandTotal: ord.grandTotal,
            taxTotal: ord.taxTotal,
            shippingFee: ord.shippingFee,
            items: (ord.items || []).map((i: any) => ({
              id: i.productId,
              name: i.productName || i.product?.name || 'Luxury Creation',
              price: i.unitPrice,
              quantity: i.quantity,
            })),
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 w-full space-y-6">
          <Skeleton className="h-20 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  const shippingAddr = order?.shippingAddress
    ? typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress
    : {};

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col selection:bg-luxury-gold selection:text-luxury-darkest">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1 space-y-8">
        {/* Celebration Banner */}
        <div className="text-center space-y-3 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-luxury-emerald via-luxury-card to-luxury-darkest border border-luxury-gold/50 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-luxury-gold text-luxury-darkest flex items-center justify-center mx-auto shadow-lg shadow-luxury-gold/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-darkest/80 border border-luxury-gold/40 text-xs text-luxury-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maison Harvest Allocated</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-brand text-white">
            Thank You for Your Order
          </h1>

          <p className="text-xs sm:text-sm text-luxury-muted max-w-md mx-auto leading-relaxed">
            Your luxury formulation order has been confirmed and assigned to our master laboratory dispatch team.
          </p>

          <div className="pt-2">
            <span className="text-xs text-luxury-muted block">Official Order Reference:</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-luxury-gold-light">
              {order?.orderNumber || params.orderId}
            </span>
          </div>
        </div>

        {/* Details 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination & Logistics */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
              <Truck className="w-4 h-4 text-luxury-gold" />
              <span>White-Glove Delivery Destination</span>
            </div>

            <div className="text-xs text-luxury-muted space-y-1">
              <span className="font-bold text-white block text-sm">{shippingAddr.name}</span>
              <p className="text-white">
                {shippingAddr.addressLine1}
                {shippingAddr.addressLine2 && `, ${shippingAddr.addressLine2}`}
              </p>
              <p>
                {shippingAddr.city}, {shippingAddr.state} - <span className="font-mono text-white">{shippingAddr.pincode}</span>
              </p>
              <p className="font-mono pt-1 text-luxury-gold-light">Contact: {shippingAddr.phone}</p>
            </div>

            <div className="pt-3 border-t border-luxury-border/60 flex items-center justify-between text-xs">
              <span className="text-luxury-muted">Estimated Delivery:</span>
              <span className="font-bold text-emerald-400">2-4 Business Days Express</span>
            </div>
          </Card>

          {/* Payment & Commercials */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span>Payment & Authorization</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-luxury-muted">
                <span>Payment Method:</span>
                <Badge variant="gold" size="sm">
                  {order?.payments?.[0]?.paymentMethod || 'PREPAID'}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-luxury-muted">
                <span>Payment Status:</span>
                <span className="text-emerald-400 font-bold">
                  {order?.payments?.[0]?.status || 'VERIFIED'}
                </span>
              </div>

              <div className="pt-2 border-t border-luxury-border/60 flex items-center justify-between text-sm font-bold font-brand text-white">
                <span>Total Amount Paid:</span>
                <span className="text-base text-luxury-gold">
                  ₹{(order?.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Ordered Items List */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
            Formulation Contents ({order?.items?.length || 0})
          </h3>

          <div className="space-y-3">
            {order?.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-luxury-surface/30 border border-luxury-border text-xs"
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                  )}
                  <div>
                    <span className="font-semibold text-white block">{item.productName}</span>
                    {item.variantName && (
                      <span className="text-[11px] text-luxury-gold font-mono block">
                        Edition: {item.variantName}
                      </span>
                    )}
                    <span className="text-[10px] text-luxury-muted">Quantity: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-white font-brand text-sm">
                  ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href={`/account/orders/${order?.id || params.orderId}`}>
            <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Track Order Status
            </Button>
          </Link>
          <Link href={`/account/orders/${order?.id || params.orderId}/invoice`} target="_blank">
            <Button variant="outline" size="md" leftIcon={<FileText className="w-4 h-4" />}>
              Download Official GST Invoice
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="ghost" size="md">
              Continue Exploring Catalogue
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
