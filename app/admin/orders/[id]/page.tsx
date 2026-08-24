'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  Package,
  Truck,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { success, error } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status Update State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dispatch Courier Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('BLUE_DART');
  const [customAwb, setCustomAwb] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data.order);
        setSelectedStatus(data.data.order.status);
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

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          comment: statusComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Order Status Updated', `Status transitioned to ${selectedStatus}`);
        setStatusComment('');
        fetchOrder();
      } else {
        error(data.error || 'Failed to transition order status');
      }
    } catch {
      error('Network error during status transition');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDispatchCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);

    try {
      const res = await fetch(`/api/admin/orders/${params.id}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courier: selectedCourier,
          customAwb: customAwb.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Shipment Created', `AWB ${data.data.shipment.awbNumber} generated via ${selectedCourier}`);
        setIsDispatchModalOpen(false);
        fetchOrder();
      } else {
        error(data.error || 'Failed to dispatch shipment');
      }
    } catch {
      error('Network error dispatching shipment');
    } finally {
      setIsDispatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) return null;

  const shippingAddr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress || {};

  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : order.guestName || shippingAddr.name || 'Valued Guest';

  const customerEmail = order.user?.email || order.guestEmail || '';
  const customerPhone = order.user?.phone || order.guestPhone || shippingAddr.phone || '';

  const shipment = order.shipments?.[0];
  const payment = order.payments?.[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Orders
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-brand text-white">
                Order {order.orderNumber}
              </h1>
              <Badge variant="gold">{order.status}</Badge>
            </div>
            <span className="text-xs text-luxury-muted block font-mono mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/orders/${order.id}/invoice`} target="_blank">
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              Official GST Invoice
            </Button>
          </Link>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsDispatchModalOpen(true)}
            leftIcon={<Truck className="w-3.5 h-3.5" />}
          >
            {shipment ? 'Re-assign Courier' : 'Dispatch Courier (AWB)'}
          </Button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLS: ITEMS & STATUS TRANSITION */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Workflow Action Box */}
          <Card className="p-5 space-y-4 border-luxury-gold/40">
            <div className="flex items-center justify-between border-b border-luxury-border/60 pb-2.5">
              <h3 className="text-xs font-bold font-brand uppercase tracking-wider text-white">
                Order State Machine Control
              </h3>
              <span className="text-xs text-luxury-muted">Current: <strong className="text-white">{order.status}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <Select
                  label="Transition To"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                  <option value="RETURN_APPROVED">RETURN_APPROVED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="REFUND_INITIATED">REFUND_INITIATED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </Select>
              </div>

              <div>
                <Input
                  label="Status Log Note / Comment"
                  placeholder="Optional internal remark"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>

              <div>
                <Button
                  variant="gold"
                  size="md"
                  className="w-full"
                  onClick={handleUpdateStatus}
                  isLoading={isUpdatingStatus}
                >
                  Apply Status Change
                </Button>
              </div>
            </div>
          </Card>

          {/* Ordered Formulations Table */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold font-brand uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
              Formulation Items ({order.items?.length || 0})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-luxury-border/60 text-luxury-muted font-mono uppercase">
                    <th className="py-2.5">Product & Edition</th>
                    <th className="py-2.5">SKU</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">GST</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <span className="font-semibold text-white block">{item.productName}</span>
                            {item.variantName && (
                              <span className="text-[10px] text-luxury-gold font-mono block">
                                {item.variantName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-luxury-muted">{item.sku}</td>
                      <td className="py-3 text-center font-bold text-white">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono text-luxury-muted">₹{item.taxAmount}</td>
                      <td className="py-3 text-right font-bold font-mono text-white">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Status Audit History Timeline */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold font-brand uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
              Status Transition Audit History
            </h3>

            <div className="space-y-3">
              {order.statusHistory?.map((h: any) => (
                <div
                  key={h.id}
                  className="flex items-start justify-between p-3.5 rounded-2xl bg-luxury-surface/30 border border-luxury-border text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" size="sm">
                        {h.toStatus}
                      </Badge>
                      <span className="text-white font-medium">{h.comment}</span>
                    </div>
                    <span className="text-[10px] text-luxury-muted font-mono block">
                      Actor: {h.performedBy || 'SYSTEM'}
                    </span>
                  </div>
                  <span className="text-[11px] text-luxury-muted font-mono whitespace-nowrap">
                    {new Date(h.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COL: CUSTOMER, LOGISTICS & FINANCIAL */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-2.5">
              <User className="w-4 h-4 text-luxury-gold" />
              <span>Patron Profile</span>
            </div>

            <div className="text-xs space-y-1.5">
              <div>
                <span className="text-luxury-muted block">Client Name:</span>
                <span className="font-bold text-white text-sm">{customerName}</span>
              </div>
              <div>
                <span className="text-luxury-muted block">Email:</span>
                <span className="font-mono text-white">{customerEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-luxury-muted block">Phone:</span>
                <span className="text-white font-mono">{customerPhone || 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Delivery Destination */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-2.5">
              <MapPin className="w-4 h-4 text-luxury-gold" />
              <span>Delivery Destination</span>
            </div>

            <div className="text-xs text-luxury-muted space-y-1">
              <p className="text-white font-bold">{shippingAddr.name}</p>
              <p>{shippingAddr.addressLine1}</p>
              {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
              <p>
                {shippingAddr.city}, {shippingAddr.state} -{' '}
                <span className="font-mono text-white font-bold">{shippingAddr.pincode}</span>
              </p>
              <p className="font-mono pt-1 text-luxury-gold-light">Phone: {shippingAddr.phone}</p>
            </div>
          </Card>

          {/* Shipment Details */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-2.5">
              <Truck className="w-4 h-4 text-luxury-gold" />
              <span>Shipment & Logistics</span>
            </div>

            {shipment ? (
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-luxury-muted">Courier:</span>
                  <span className="font-bold text-white">{shipment.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-muted">AWB Number:</span>
                  <span className="font-mono text-luxury-gold-light font-bold">{shipment.awbNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxury-muted">Carrier Status:</span>
                  <Badge variant="neutral" size="sm">{shipment.status}</Badge>
                </div>
                {shipment.trackingUrl && (
                  <div className="pt-2">
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-luxury-gold-light hover:underline flex items-center gap-1"
                    >
                      <span>Open Courier Tracking</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-luxury-muted italic">
                No courier shipment generated yet. Click "Dispatch Courier" to assign AWB.
              </p>
            )}
          </Card>

          {/* Financial Breakdown */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span>Commercial Summary</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-luxury-muted">
                <span>Subtotal:</span>
                <span className="font-mono text-white font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon ({order.couponCode}):</span>
                  <span className="font-mono">-₹{order.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-luxury-muted">
                <span>GST Tax:</span>
                <span className="font-mono text-white">₹{order.taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-luxury-muted">
                <span>Shipping:</span>
                <span className="font-mono text-white">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="pt-2 border-t border-luxury-border/60 flex justify-between text-sm font-bold font-brand text-white">
                <span>Grand Total:</span>
                <span className="text-luxury-gold">₹{order.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-luxury-border/60 text-xs">
              <div className="flex justify-between text-luxury-muted">
                <span>Payment Method:</span>
                <Badge variant="gold" size="sm">{payment?.paymentMethod || 'PREPAID'}</Badge>
              </div>
              <div className="flex justify-between text-luxury-muted mt-1">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-400">{payment?.status || 'VERIFIED'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dispatch Courier Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch Shipment & Generate AWB"
        subtitle={`Assign logistics courier for Order ${order.orderNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleDispatchCourier} className="space-y-4">
          <Select
            label="Courier Partner"
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
          >
            <option value="BLUE_DART">Blue Dart Luxury Express (Air Priority)</option>
            <option value="DELHIVERY">Delhivery Direct Air (Express)</option>
          </Select>

          <Input
            label="Custom AWB (Optional - Auto-generated if left blank)"
            placeholder="e.g. BD-LUX-9988771"
            value={customAwb}
            onChange={(e) => setCustomAwb(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-luxury-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isDispatching}>
              Dispatch & Assign AWB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
