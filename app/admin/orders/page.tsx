'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  ShoppingBag,
  Search,
  Truck,
  Eye,
  Filter,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { error } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('ALL');

  const fetchOrders = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      if (search) sp.set('search', search);
      if (status !== 'ALL') sp.set('status', status);
      if (paymentMethod !== 'ALL') sp.set('paymentMethod', paymentMethod);
      sp.set('page', String(page));

      const res = await fetch(`/api/admin/orders?${sp.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        error(data.error || 'Failed to load orders');
      }
    } catch {
      error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [status, paymentMethod]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'SHIPPED':
        return <Badge variant="gold">SHIPPED</Badge>;
      case 'PACKED':
      case 'CONFIRMED':
        return <Badge variant="neutral">{orderStatus}</Badge>;
      case 'CANCELLED':
      case 'FAILED':
        return <Badge variant="danger">{orderStatus}</Badge>;
      case 'RETURN_REQUESTED':
      case 'REFUNDED':
        return <Badge variant="warning">{orderStatus}</Badge>;
      default:
        return <Badge variant="gold">{orderStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Order Management Suite
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Monitor, fulfill, dispatch shipments, and track commerce operations across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/returns">
            <Button variant="outline" size="sm">
              Returns & Refunds
            </Button>
          </Link>
          <Button variant="gold" size="sm" onClick={() => fetchOrders(pagination.page)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Orders
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by Order #, Patron Name, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-luxury-muted" />}
            />
          </div>

          <div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
              <option value="REFUNDED">REFUNDED</option>
            </Select>
          </div>

          <div>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Credit/Debit Cards</option>
              <option value="NETBANKING">Net Banking</option>
              <option value="COD">Cash on Delivery</option>
            </Select>
          </div>
        </form>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-luxury-muted mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-luxury-muted">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-luxury-border/60 bg-luxury-emerald/20 text-luxury-muted font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order Reference</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patron Clientèle</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Courier / AWB</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/40">
                {orders.map((order) => {
                  const customerName = order.user
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : order.guestName || 'Guest Patron';
                  const customerEmail = order.user?.email || order.guestEmail || '';
                  const shipment = order.shipments?.[0];

                  return (
                    <tr key={order.id} className="hover:bg-luxury-surface/30 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-luxury-gold-light">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-luxury-muted font-mono whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-white block">{customerName}</span>
                        <span className="text-[10px] text-luxury-muted font-mono">{customerEmail}</span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="neutral" size="sm">
                          {order.payments?.[0]?.paymentMethod || 'PREPAID'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px]">
                        {shipment?.awbNumber ? (
                          <span className="text-luxury-gold-light">{shipment.awbNumber}</span>
                        ) : (
                          <span className="text-luxury-muted">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-bold font-brand text-sm text-white">
                        ₹{order.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-luxury-border/60 flex items-center justify-between text-xs text-luxury-muted">
            <span>
              Showing Page <strong className="text-white">{pagination.page}</strong> of{' '}
              <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} orders)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchOrders(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchOrders(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
