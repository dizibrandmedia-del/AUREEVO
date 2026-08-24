'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  Sparkles,
  Users,
  Boxes,
  AlertTriangle,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Warehouse,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { MetricCard, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastContext';

export default function AdminDashboardPage() {
  const { error } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats);
          setLowStockItems(data.data.lowStockItems);
          setRecentActivity(data.data.recentActivity);
          setRecentProducts(data.data.recentProducts);
        } else {
          error(data.error || 'Failed to load dashboard data');
        }
      })
      .catch(() => {
        error('Failed to load dashboard metrics');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-brand tracking-wide text-white">
              AUREEVO Control Suite
            </h1>
            <Badge variant="gold" size="sm">Phase 1 Operational</Badge>
          </div>
          <p className="text-xs text-luxury-muted mt-1">
            Real-time catalogue architecture, inventory levels, and enterprise system activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/products/new">
            <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="emerald" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Category
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button variant="outline" size="sm">
              Adjust Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid (8 Live Database Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.activeProducts || 0} active, ${stats?.draftProducts || 0} drafts`}
          icon={<Package className="w-5 h-5" />}
        />
        <MetricCard
          title="Categories"
          value={stats?.totalCategories || 0}
          subtitle="Unlimited hierarchy tree"
          icon={<Layers className="w-5 h-5" />}
        />
        <MetricCard
          title="Luxury Brands"
          value={stats?.totalBrands || 0}
          subtitle="Active partner brands"
          icon={<Sparkles className="w-5 h-5" />}
        />
        <MetricCard
          title="Customer Accounts"
          value={stats?.totalCustomers || 0}
          subtitle="Registered customer base"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Units in Stock"
          value={stats?.totalStock || 0}
          subtitle="Across all warehouses"
          icon={<Boxes className="w-5 h-5" />}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={stats?.lowStockCount || 0}
          subtitle="At or below threshold"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          className={stats?.lowStockCount > 0 ? 'border-amber-700/60' : ''}
        />
        <MetricCard
          title="Out of Stock"
          value={stats?.outOfStockCount || 0}
          subtitle="Zero available inventory"
          icon={<XCircle className="w-5 h-5 text-rose-400" />}
          className={stats?.outOfStockCount > 0 ? 'border-rose-800/60' : ''}
        />
        <MetricCard
          title="Active Warehouses"
          value="2"
          subtitle="Mumbai Hub (Default)"
          icon={<Warehouse className="w-5 h-5" />}
        />
      </div>

      {/* Main Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alert Watchlist */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-700/50 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-brand text-white">
                    Inventory Replenishment Watchlist
                  </h3>
                  <p className="text-xs text-luxury-muted">Items requiring stock adjustments</p>
                </div>
              </div>
              <Link href="/admin/inventory">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Manage All
                </Button>
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                title="All Stock Levels Optimal"
                description="No products are currently below their low stock replenishment threshold."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-semibold text-white truncate max-w-xs">
                          {item.productName}
                        </div>
                        {item.variantName && (
                          <div className="text-[11px] text-luxury-gold-light">
                            {item.variantName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-luxury-muted">{item.sku}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-luxury-muted">{item.warehouseName}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-white text-sm">{item.currentStock}</span>
                        <span className="text-[11px] text-luxury-muted block">
                          Limit: {item.lowStockThreshold}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.status === 'OUT_OF_STOCK' ? (
                          <Badge variant="rose">Out of Stock</Badge>
                        ) : (
                          <Badge variant="amber">Low Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/inventory?search=${encodeURIComponent(item.sku)}`}>
                          <Button variant="emerald" size="sm">
                            Adjust
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Recently Added Products */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-brand text-white">Latest Catalogue Additions</h3>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All Products
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border/60 hover:border-luxury-gold/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-luxury-emerald/60 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center">
                      {p.images ? (
                        <img
                          src={JSON.parse(p.images)[0] || '/images/aureevo-logo.png'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-luxury-gold" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white truncate max-w-sm">{p.name}</h4>
                      <p className="text-[11px] text-luxury-muted">
                        {p.brand?.name || 'AUREEVO'} • {p.category?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-luxury-gold-light">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <Badge variant={p.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Recent Audit Trail */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-luxury-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-luxury-gold" />
                <h3 className="text-base font-bold font-brand text-white">Live Activity Stream</h3>
              </div>
              <Link href="/admin/activity-logs">
                <Button variant="ghost" size="sm">
                  Logs
                </Button>
              </Link>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-luxury-muted text-center py-6">No recent logs</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs pb-3 border-b border-luxury-border/40 last:border-0">
                    <div className="w-7 h-7 rounded-lg bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-[10px] font-bold text-luxury-gold shrink-0 mt-0.5">
                      {log.adminUser?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate">
                          {log.adminUser?.name || 'System'}
                        </span>
                        <span className="text-[10px] text-luxury-muted/70">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-luxury-gold-light mt-0.5 font-medium">
                        {log.action} • <span className="text-luxury-muted">{log.entity}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Fast Navigation Quick Links */}
          <Card>
            <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-muted mb-3">
              Phase 1 Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/attributes"
                className="p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border/60 hover:bg-luxury-surface hover:text-luxury-gold transition-colors text-center"
              >
                Attributes
              </Link>
              <Link
                href="/admin/brands"
                className="p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border/60 hover:bg-luxury-surface hover:text-luxury-gold transition-colors text-center"
              >
                Brands
              </Link>
              <Link
                href="/admin/media"
                className="p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border/60 hover:bg-luxury-surface hover:text-luxury-gold transition-colors text-center"
              >
                Media Assets
              </Link>
              <Link
                href="/admin/import-export"
                className="p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border/60 hover:bg-luxury-surface hover:text-luxury-gold transition-colors text-center"
              >
                CSV Import/Export
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
