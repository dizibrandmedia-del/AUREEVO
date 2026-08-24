'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Percent,
  CheckCircle2,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '0',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '1',
    isFirstOrderOnly: false,
    isCodAllowed: true,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data.coupons);
      } else {
        error(data.error || 'Failed to load coupons');
      }
    } catch {
      error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '0',
      maxDiscount: '',
      usageLimit: '',
      perUserLimit: '1',
      isFirstOrderOnly: false,
      isCodAllowed: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderValue: String(coupon.minOrderValue || 0),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      perUserLimit: String(coupon.perUserLimit || 1),
      isFirstOrderOnly: coupon.isFirstOrderOnly,
      isCodAllowed: coupon.isCodAllowed,
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = '/api/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';
      const payload = editingCoupon ? { id: editingCoupon.id, ...formData } : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success('Success', `Privilege coupon ${editingCoupon ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        error(data.error || 'Failed to save coupon');
      }
    } catch {
      error('Network error saving coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this privilege coupon?')) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Deleted', 'Coupon deleted successfully');
        fetchCoupons();
      } else {
        error(data.error || 'Failed to delete coupon');
      }
    } catch {
      error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Privilege Vouchers & Promotions
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Configure luxury discount vouchers, exclusive clientele quotas, and minimum order rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Privilege Voucher
          </Button>
          <Button variant="outline" size="sm" onClick={fetchCoupons} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-luxury-muted mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-white">No Coupons Configured</h3>
            <p className="text-xs text-luxury-muted">Click "Create Privilege Voucher" to add your first promotion.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-luxury-border/60 bg-luxury-emerald/20 text-luxury-muted font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">Voucher Code</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4">Benefit</th>
                  <th className="py-3.5 px-4">Min. Bag Value</th>
                  <th className="py-3.5 px-4">Usage / Cap</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border/40">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-luxury-surface/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-luxury-gold-light text-sm">
                      {coupon.code}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-white block">{coupon.name}</span>
                      <span className="text-[10px] text-luxury-muted block truncate max-w-xs">
                        {coupon.description || 'No description provided'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} FLAT OFF`}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue.toLocaleString('en-IN')}` : 'None'}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {coupon.usageCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="py-4 px-4">
                      {coupon.isActive ? (
                        <Badge variant="success" size="sm">ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">INACTIVE</Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(coupon)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-400 hover:bg-rose-950/40"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Privilege Voucher' : 'Create Privilege Voucher'}
        subtitle="Manage discount rules, caps, and activation parameters"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Voucher Code *"
              placeholder="e.g. ROYAL20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              disabled={!!editingCoupon}
            />
            <Input
              label="Campaign Name *"
              placeholder="e.g. Royal Privilege 20% Privilege"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <Input
            label="Editorial Description"
            placeholder="Brief explanation shown on voucher badges..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Discount Type"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount (INR)</option>
            </Select>

            <Input
              label="Discount Value *"
              type="number"
              placeholder="e.g. 10"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />

            <Input
              label="Max Discount Cap (INR)"
              type="number"
              placeholder="e.g. 2000"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Min Bag Subtotal (INR)"
              type="number"
              placeholder="e.g. 5000"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
            />

            <Input
              label="Global Usage Limit"
              type="number"
              placeholder="e.g. 100 (Blank for unlimited)"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            />

            <Input
              label="Per-User Limit"
              type="number"
              value={formData.perUserLimit}
              onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFirstOrderOnly}
                onChange={(e) => setFormData({ ...formData, isFirstOrderOnly: e.target.checked })}
                className="rounded border-luxury-border text-luxury-gold focus:ring-luxury-gold"
              />
              <span className="text-white">First-Time Client Acquisition Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCodAllowed}
                onChange={(e) => setFormData({ ...formData, isCodAllowed: e.target.checked })}
                className="rounded border-luxury-border text-luxury-gold focus:ring-luxury-gold"
              />
              <span className="text-white">Allow with COD Orders</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-luxury-border text-luxury-gold focus:ring-luxury-gold"
              />
              <span className="text-emerald-400 font-bold">Voucher Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-luxury-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
              {editingCoupon ? 'Update Voucher' : 'Create Voucher'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
