'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Edit2,
  Trash2,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';

export default function WarehousesPage() {
  const { success, error } = useToast();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formContactName, setFormContactName] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formStatus, setFormStatus] = useState('ACTIVE');

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/warehouses');
      const data = await res.json();
      if (data.success) {
        setWarehouses(data.data.warehouses);
      } else {
        error(data.error || 'Failed to fetch warehouses');
      }
    } catch {
      error('Failed to load warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const openCreateModal = () => {
    setEditingWarehouse(null);
    setFormName('');
    setFormCode('');
    setFormAddress('');
    setFormCity('');
    setFormState('');
    setFormCountry('India');
    setFormContactName('');
    setFormContactPhone('');
    setFormContactEmail('');
    setFormIsDefault(false);
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (wh: any) => {
    setEditingWarehouse(wh);
    setFormName(wh.name);
    setFormCode(wh.code);
    setFormAddress(wh.address || '');
    setFormCity(wh.city || '');
    setFormState(wh.state || '');
    setFormCountry(wh.country || 'India');
    setFormContactName(wh.contactName || '');
    setFormContactPhone(wh.contactPhone || '');
    setFormContactEmail(wh.contactEmail || '');
    setFormIsDefault(wh.isDefault);
    setFormStatus(wh.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formName,
      code: formCode.toUpperCase().trim(),
      address: formAddress || null,
      city: formCity || null,
      state: formState || null,
      country: formCountry || 'India',
      contactName: formContactName || null,
      contactPhone: formContactPhone || null,
      contactEmail: formContactEmail || null,
      isDefault: formIsDefault,
      status: formStatus,
    };

    try {
      const url = editingWarehouse
        ? `/api/admin/warehouses/${editingWarehouse.id}`
        : '/api/admin/warehouses';
      const method = editingWarehouse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(editingWarehouse ? 'Warehouse updated' : 'Warehouse created');
        setIsModalOpen(false);
        fetchWarehouses();
      } else {
        error(data.error || 'Failed to save warehouse');
      }
    } catch {
      error('Network error saving warehouse');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarehouse) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/warehouses/${deletingWarehouse.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Warehouse deleted');
        setIsDeleteDialogOpen(false);
        fetchWarehouses();
      } else {
        error(data.error || 'Failed to delete warehouse');
      }
    } catch {
      error('Network error deleting warehouse');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Warehouse Network
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Multi-facility fulfillment nodes, central hubs, and regional distribution centers.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Warehouse
        </Button>
      </div>

      {/* Warehouses Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh) => (
            <Card key={wh.id} className="relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-luxury-gold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-brand">{wh.name}</h3>
                      {wh.isDefault && (
                        <Badge variant="gold" size="sm">Primary Hub</Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs text-luxury-gold-light mt-0.5 block">
                      Code: {wh.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(wh)}
                    className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!wh.isDefault && (
                    <button
                      onClick={() => {
                        setDeletingWarehouse(wh);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-luxury-border/60 space-y-1.5 text-xs text-luxury-muted">
                {wh.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                    <span>
                      {wh.address}, {wh.city}, {wh.state}
                    </span>
                  </div>
                )}
                {wh.contactName && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                    <span>
                      {wh.contactName} {wh.contactPhone && `(${wh.contactPhone})`}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse' : 'Register Fulfillment Warehouse'}
        subtitle="Configure physical warehouse address, code, and default routing status."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Warehouse Name *"
              placeholder="e.g. AUREEVO Central Fulfillment Center"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <Input
              label="Warehouse Code *"
              placeholder="WH-MUM-01"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              required
            />
          </div>

          <Input
            label="Street Address"
            placeholder="Plot 42, Bandra-Kurla Complex Luxury Park"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              placeholder="Mumbai"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
            />
            <Input
              label="State"
              placeholder="Maharashtra"
              value={formState}
              onChange={(e) => setFormState(e.target.value)}
            />
            <Input
              label="Country"
              value={formCountry}
              onChange={(e) => setFormCountry(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Person"
              placeholder="Vikramaditya Roy"
              value={formContactName}
              onChange={(e) => setFormContactName(e.target.value)}
            />
            <Input
              label="Contact Phone"
              placeholder="+91 22 4500 8900"
              value={formContactPhone}
              onChange={(e) => setFormContactPhone(e.target.value)}
            />
            <Input
              label="Contact Email"
              placeholder="logistics@aureevo.com"
              value={formContactEmail}
              onChange={(e) => setFormContactEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Select
              label="Operational Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
                Primary Facility
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
                />
                <span>Set as Default Fulfillment Center</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSaving}>
              {editingWarehouse ? 'Save Changes' : 'Register Facility'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${deletingWarehouse?.name}"? You cannot delete the default warehouse or a facility currently holding active inventory.`}
        confirmText="Delete Warehouse"
        isLoading={isDeleting}
      />
    </div>
  );
}
