'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  CreditCard,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AdminReturnsPage() {
  const { success, error } = useToast();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process Modal State
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REFUND'>('APPROVE');
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/returns');
      const data = await res.json();
      if (data.success) {
        setReturns(data.data.returns);
      } else {
        error(data.error || 'Failed to load returns');
      }
    } catch {
      error('Failed to load returns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnRequestId: selectedReturn.id,
          action: actionType,
          adminComment,
          refundAmount: selectedReturn.refundAmount || selectedReturn.order?.grandTotal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Action Completed', `Return request ${actionType.toLowerCase()}d successfully`);
        setSelectedReturn(null);
        setAdminComment('');
        fetchReturns();
      } else {
        error(data.error || 'Failed to process return action');
      }
    } catch {
      error('Network error processing return');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'APPROVED':
        return <Badge variant="gold">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Returns, Replacements & Refunds
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Evaluate patron return requests, reverse logistics, and process secured financial refunds.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={fetchReturns} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Queue
        </Button>
      </div>

      {/* Returns Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <RotateCcw className="w-10 h-10 text-luxury-muted mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-white">No Return Requests</h3>
            <p className="text-xs text-luxury-muted">All client return requests are currently fulfilled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-luxury-border/60 bg-luxury-emerald/20 text-luxury-muted font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">Request #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patron & Order</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Refund Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/40">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-luxury-surface/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-luxury-gold-light">
                      {ret.requestNumber}
                    </td>
                    <td className="py-4 px-4 text-luxury-muted font-mono whitespace-nowrap">
                      {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-white block">
                        {ret.user?.firstName} {ret.user?.lastName}
                      </span>
                      <Link
                        href={`/admin/orders/${ret.order?.id}`}
                        className="text-[10px] text-luxury-gold hover:underline font-mono"
                      >
                        Order #{ret.order?.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4 font-bold">{ret.type}</td>
                    <td className="py-4 px-4 text-luxury-muted max-w-xs truncate">{ret.reason}</td>
                    <td className="py-4 px-4">{getStatusBadge(ret.status)}</td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ₹{(ret.refundAmount || ret.order?.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {ret.status === 'PENDING' && (
                          <>
                            <Button
                              variant="gold"
                              size="sm"
                              onClick={() => {
                                setSelectedReturn(ret);
                                setActionType('APPROVE');
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-400 border border-rose-800"
                              onClick={() => {
                                setSelectedReturn(ret);
                                setActionType('REJECT');
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {ret.status === 'APPROVED' && (
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => {
                              setSelectedReturn(ret);
                              setActionType('REFUND');
                            }}
                          >
                            Execute Refund
                          </Button>
                        )}
                        {ret.status === 'COMPLETED' && (
                          <span className="text-[11px] text-emerald-400 font-mono font-bold">
                            Refunded ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Process Modal */}
      <Modal
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title={`${actionType === 'REFUND' ? 'Execute Financial Refund' : `${actionType} Return Request`}`}
        subtitle={`Request ${selectedReturn?.requestNumber} for Order ${selectedReturn?.order?.orderNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleProcessAction} className="space-y-4">
          <div className="p-3 rounded-xl bg-luxury-surface/40 border border-luxury-border text-xs space-y-1">
            <span className="text-luxury-muted block">Patron Claim Reason:</span>
            <p className="text-white font-medium">{selectedReturn?.reason}</p>
            {selectedReturn?.description && (
              <p className="text-luxury-muted italic">"{selectedReturn.description}"</p>
            )}
          </div>

          {actionType === 'REFUND' && (
            <div className="p-3 rounded-xl bg-luxury-emerald/30 border border-luxury-gold/40 text-xs">
              <span className="text-luxury-gold-light font-bold block">Refund Amount (INR):</span>
              <span className="text-xl font-bold font-mono text-white">
                ₹{(selectedReturn?.refundAmount || selectedReturn?.order?.grandTotal || 0).toLocaleString('en-IN')}
              </span>
              <p className="text-[10px] text-luxury-muted mt-1">
                Settled to original payment method via Razorpay/Stripe gateway.
              </p>
            </div>
          )}

          <Input
            label="Internal Remarks / Concierge Note"
            placeholder="e.g. Verified batch sealed & eligible for return."
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-luxury-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedReturn(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={actionType === 'REJECT' ? 'outline' : 'gold'}
              size="sm"
              isLoading={isProcessing}
              className={actionType === 'REJECT' ? 'text-rose-400 border-rose-800' : ''}
            >
              Confirm {actionType}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
