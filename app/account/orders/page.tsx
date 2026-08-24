'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CustomerOrdersListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.orders) {
          setOrders(data.data.orders);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-luxury-muted mx-auto opacity-50" />
        <h3 className="text-sm font-bold text-white">No Order Formulations Found</h3>
        <p className="text-xs text-luxury-muted max-w-sm mx-auto">
          You haven't placed any luxury formulation orders yet. Explore our curated collections.
        </p>
        <Link href="/shop">
          <Button variant="gold" size="sm">
            Explore Catalogue
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-luxury-border/60 pb-3">
        <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
          Clientèle Order Vault ({orders.length})
        </h3>
        <p className="text-xs text-luxury-muted">
          Real-time logistics status and official invoices for all your acquisitions.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const shipment = order.shipments?.[0];
          return (
            <Card key={order.id} className="p-6 space-y-4 hover:border-luxury-gold/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-luxury-gold-light">
                      {order.orderNumber}
                    </span>
                    <Badge variant="gold">{order.status}</Badge>
                  </div>
                  <span className="text-xs text-luxury-muted block mt-0.5">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {shipment?.awbNumber && ` • Courier AWB: ${shipment.awbNumber}`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-luxury-muted block uppercase">Grand Total</span>
                    <span className="text-base font-bold font-brand text-white">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details & Track
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items Preview */}
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <span className="text-white font-medium">{item.productName}</span>
                      <span className="text-luxury-muted">× {item.quantity}</span>
                    </div>
                    <span className="font-mono text-white">
                      ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
