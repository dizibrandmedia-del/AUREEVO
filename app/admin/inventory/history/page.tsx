'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, ArrowLeft, RefreshCw, Boxes, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastContext';

export default function StockHistoryPage() {
  const { error } = useToast();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/inventory/history?limit=100');
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.data.history);
      } else {
        error(data.error || 'Failed to fetch history');
      }
    } catch {
      error('Failed to load stock audit history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div className="flex items-center gap-3">
          <Link href="/admin/inventory">
            <button
              type="button"
              className="p-2 rounded-xl bg-luxury-surface/50 border border-luxury-border hover:bg-luxury-surface text-luxury-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
              Stock History Audit Trail
            </h1>
            <p className="text-xs text-luxury-muted mt-0.5">
              Immutable log of every physical quantity modification with delta values and administrator signatures.
            </p>
          </div>
        </div>

        <Button variant="emerald" size="sm" onClick={fetchHistory} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Log
        </Button>
      </div>

      {/* History Log Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {historyList.length === 0 ? (
            <EmptyState
              icon={<History className="w-8 h-8" />}
              title="No Stock Movements Logged"
              description="Stock adjustment records will appear here automatically when inventory is modified."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Product / Variant</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                  <TableHead className="text-center">Previous → New</TableHead>
                  <TableHead className="text-center">Net Delta</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                  <TableHead>Administrator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyList.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-xs text-white font-mono">{formatDate(log.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-white text-xs">{log.product?.name}</div>
                      <div className="text-[11px] text-luxury-muted font-mono">
                        {log.variant ? `${log.variant.name} (${log.variant.sku})` : log.product?.sku}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-luxury-gold-light">{log.warehouse?.name}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          log.action === 'RESTOCK' || log.action === 'INITIAL'
                            ? 'emerald'
                            : log.action === 'DAMAGE'
                            ? 'rose'
                            : 'neutral'
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-luxury-muted font-mono">
                        {log.previousQty} → <span className="font-bold text-white">{log.newQty}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-mono text-xs font-bold ${
                          log.diffQty > 0
                            ? 'text-emerald-400'
                            : log.diffQty < 0
                            ? 'text-rose-400'
                            : 'text-white'
                        }`}
                      >
                        {log.diffQty > 0 ? `+${log.diffQty}` : log.diffQty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-luxury-muted max-w-xs truncate block">
                        {log.reason || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-white flex items-center gap-1">
                        <User className="w-3 h-3 text-luxury-gold" />
                        {log.adminUser?.name || 'System'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
