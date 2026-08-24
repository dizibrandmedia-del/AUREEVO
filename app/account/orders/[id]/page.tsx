'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  XCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  const { success, error } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [canReturn, setCanReturn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Return Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnType, setReturnType] = useState('RETURN');
  const [returnReason, setReturnReason] = useState('Incorrect formulation sent');
  const [returnDesc, setReturnDesc] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data.order);
        setCanCancel(data.data.canCancel);
        setCanReturn(data.data.canReturn);
      } else {
        error(data.error || 'Failed to load order');
      }
    } catch {
      error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL',
          cancelReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Order Cancelled', 'Your order cancellation request has been processed');
        setIsCancelModalOpen(false);
        fetchOrder();
      } else {
        error(data.error || 'Failed to cancel order');
      }
    } catch {
      error('Network error during cancellation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReturn(true);

    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RETURN',
          returnType,
          reason: returnReason,
          description: returnDesc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Return Request Lodged', 'Our quality concierge will evaluate your request');
        setIsReturnModalOpen(false);
        fetchOrder();
      } else {
        error(data.error || 'Failed to submit return request');
      }
    } catch {
      error('Network error submitting return');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) return null;

  const shippingAddr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress || {};

  const shipment = order.shipments?.[0];

  const milestones = [
    { title: 'Order Placed', status: 'NEW', reached: true },
    {
      title: 'Payment Confirmed',
      status: 'CONFIRMED',
      reached: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
        order.status
      ),
    },
    {
      title: 'Vault Packaging',
      status: 'PACKED',
      reached: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
    },
    {
      title: 'Dispatched via Courier',
      status: 'SHIPPED',
      reached: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
    },
    {
      title: 'White-Glove Delivered',
      status: 'DELIVERED',
      reached: order.status === 'DELIVERED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold font-brand text-white">
              Order {order.orderNumber}
            </h2>
            <Badge variant="gold">{order.status}</Badge>
          </div>
          <span className="text-xs text-luxury-muted block mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/account/orders/${order.id}/invoice`} target="_blank">
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              GST Invoice
            </Button>
          </Link>
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 border border-rose-800 hover:bg-rose-950/40"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel Order
            </Button>
          )}
          {canReturn && (
            <Button
              variant="gold"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setIsReturnModalOpen(true)}
            >
              Request Return / Refund
            </Button>
          )}
        </div>
      </div>

      {/* Shipment Tracker Card */}
      <Card className="p-6 space-y-6 border-luxury-gold/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-luxury-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-luxury-gold" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Live Logistics Milestone Tracker
            </h3>
          </div>
          {shipment?.awbNumber && (
            <span className="text-xs font-mono text-luxury-gold-light">
              AWB: {shipment.awbNumber} ({shipment.courier})
            </span>
          )}
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-xs space-y-1 ${
                m.reached
                  ? 'bg-luxury-emerald/40 border-luxury-gold/40 text-luxury-gold-light'
                  : 'bg-luxury-surface/30 border-luxury-border text-luxury-muted opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-white">
                {m.reached ? (
                  <CheckCircle2 className="w-4 h-4 text-luxury-gold shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-luxury-muted shrink-0" />
                )}
                <span className="truncate">{m.title}</span>
              </div>
            </div>
          ))}
        </div>

        {shipment?.trackingUrl && (
          <div className="pt-2 flex justify-end">
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-luxury-gold-light hover:underline font-semibold flex items-center gap-1"
            >
              <span>Track Live on {shipment.courier} Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </Card>

      {/* Items & Financial Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ordered Items */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
            Formulation Contents ({order.items?.length || 0})
          </h3>

          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-luxury-surface/30 border border-luxury-border text-xs"
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
                    <span className="text-[10px] text-luxury-muted font-mono">
                      SKU: {item.sku} • Quantity: {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-white font-brand text-sm">
                  ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Summary */}
        <Card className="lg:col-span-1 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
            Order Commercials
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-luxury-muted">
              <span>Subtotal</span>
              <span className="text-white font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>

            {order.couponDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Voucher ({order.couponCode})</span>
                <span>-₹{order.couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-luxury-muted">
              <span>GST Tax (18.0%)</span>
              <span className="text-white">₹{order.taxTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-luxury-muted">
              <span>White-Glove Delivery</span>
              <span className={order.shippingFee === 0 ? 'text-emerald-400 font-semibold' : 'text-white'}>
                {order.shippingFee === 0 ? 'COMPLIMENTARY' : `₹${order.shippingFee}`}
              </span>
            </div>

            <div className="pt-3 border-t border-luxury-border/60 flex items-center justify-between text-sm font-bold font-brand text-white">
              <span>Total Paid</span>
              <span className="text-base text-luxury-gold">₹{order.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted space-y-1">
            <span className="font-bold text-white block">Delivery Destination:</span>
            <p>{shippingAddr.name}</p>
            <p>{shippingAddr.addressLine1}</p>
            <p>
              {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pincode}
            </p>
          </div>
        </Card>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order Request"
        subtitle="This action will release allocated vault inventory reservations."
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Reason for Cancellation"
            placeholder="e.g. Changed formulation preference"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-luxury-border">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-400 border-rose-800"
              onClick={handleCancelOrder}
              isLoading={isCancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Lodge Return / Replacement Request"
        subtitle="Our quality assurance concierge will arrange reverse courier inspection."
        maxWidth="md"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Select
            label="Requested Action"
            value={returnType}
            onChange={(e) => setReturnType(e.target.value)}
          >
            <option value="RETURN">Return & Full Refund to Original Source</option>
            <option value="REPLACEMENT">Direct Replacement with Fresh Vault Harvest</option>
            <option value="REFUND">Store Credit Wallet Refund</option>
          </Select>

          <Select
            label="Reason Category"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
          >
            <option value="Incorrect formulation sent">Incorrect formulation sent</option>
            <option value="Damaged in transit / broken seal">Damaged in transit / broken seal</option>
            <option value="Defective dispenser / pump">Defective dispenser / pump</option>
            <option value="Allergic sensitivity / consultation required">
              Allergic sensitivity / consultation required
            </option>
          </Select>

          <Input
            label="Detailed Description"
            placeholder="Provide context regarding batch condition..."
            value={returnDesc}
            onChange={(e) => setReturnDesc(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-luxury-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSubmittingReturn}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
