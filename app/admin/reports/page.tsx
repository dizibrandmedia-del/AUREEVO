'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  Calendar,
  Percent,
} from 'lucide-react';

export default function AdminReportsPage() {
  const { error } = useToast();
  const [period, setPeriod] = useState('30days');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        error(data.error || 'Failed to load report data');
      }
    } catch {
      error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExportCsv = () => {
    window.open(`/api/admin/reports?period=${period}&export=csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Commerce Analytics & Reports
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Real-time financial performance, luxury order metrics, tax ledger, and operational insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </Select>

          <Button variant="gold" size="sm" onClick={handleExportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-luxury-gold/40 relative overflow-hidden bg-gradient-to-br from-luxury-emerald/40 via-luxury-card to-luxury-surface/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-luxury-muted uppercase tracking-wider font-semibold">
                  Gross Revenue
                </span>
                <DollarSign className="w-5 h-5 text-luxury-gold" />
              </div>
              <p className="text-2xl font-bold font-brand text-luxury-gold-light mt-2">
                ₹{(reportData?.summary?.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                {reportData?.summary?.validOrderCount || 0} Successful Orders
              </span>
            </Card>

            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-luxury-muted uppercase tracking-wider font-semibold">
                  Avg. Order Value (AOV)
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-brand text-white mt-2">
                ₹{(reportData?.summary?.averageOrderValue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-luxury-muted mt-1 block">
                Across luxury shopping bags
              </span>
            </Card>

            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-luxury-muted uppercase tracking-wider font-semibold">
                  GST Tax Collected (18%)
                </span>
                <Percent className="w-5 h-5 text-luxury-gold" />
              </div>
              <p className="text-2xl font-bold font-brand text-white mt-2">
                ₹{(reportData?.summary?.totalTaxCollected || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-luxury-muted font-mono mt-1 block">
                CGST 9% + SGST 9%
              </span>
            </Card>

            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-luxury-muted uppercase tracking-wider font-semibold">
                  Processed Refunds
                </span>
                <RotateCcw className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-2xl font-bold font-brand text-rose-400 mt-2">
                ₹{(reportData?.summary?.totalRefundsAmount || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-luxury-muted mt-1 block">
                {reportData?.summary?.returnCount || 0} Return Requests
              </span>
            </Card>
          </div>

          {/* 2-Column Analytical Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
                <CreditCard className="w-4 h-4 text-luxury-gold" />
                <span>Payment Settlement Channels</span>
              </div>

              <div className="space-y-3">
                {Object.entries(reportData?.paymentMethodCounts || {}).map(([method, data]: any) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-3 rounded-2xl bg-luxury-surface/30 border border-luxury-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" size="sm">
                        {method}
                      </Badge>
                      <span className="text-luxury-muted">{data.count} transactions</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ₹{data.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Performing Formulations */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
                <ShoppingBag className="w-4 h-4 text-luxury-gold" />
                <span>Top Grossing Formulations</span>
              </div>

              <div className="space-y-3">
                {reportData?.topProducts?.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-luxury-surface/30 border border-luxury-border text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-luxury-muted">{p.quantity} units fulfilled</span>
                    </div>
                    <span className="font-mono font-bold text-luxury-gold-light text-sm">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
