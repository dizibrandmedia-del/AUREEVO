'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastContext';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export default function AddressesPage() {
  const { success, error } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState('HOME');
  const [isDefault, setIsDefault] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account/addresses');
      const data = await res.json();
      if (data.success) setAddresses(data.data.addresses);
    } catch {
      error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddress(null);
    setName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPincode('');
    setLandmark('');
    setAddressType('HOME');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: any) => {
    setEditingAddress(addr);
    setName(addr.name);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setLandmark(addr.landmark || '');
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      error('Please enter a valid 6-digit Indian delivery pincode');
      return;
    }

    setIsSaving(true);
    const payload = {
      id: editingAddress?.id,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      addressType,
      isDefault,
    };

    try {
      const method = editingAddress ? 'PUT' : 'POST';
      const res = await fetch('/api/account/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(editingAddress ? 'Address updated' : 'Address saved');
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        error(data.error || 'Failed to save address');
      }
    } catch {
      error('Network error saving address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/account/addresses?id=${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Address deleted');
        setIsDeleteDialogOpen(false);
        fetchAddresses();
      } else {
        error(data.error || 'Failed to delete address');
      }
    } catch {
      error('Network error deleting address');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
            Saved Delivery Locations
          </h3>
          <p className="text-xs text-luxury-muted">
            Manage physical addresses for white-glove courier routing.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Address
        </Button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            className={`p-5 space-y-3 relative ${
              addr.isDefault ? 'border-luxury-gold/60 bg-luxury-emerald/20' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{addr.name}</span>
                <Badge variant={addr.isDefault ? 'gold' : 'neutral'} size="sm">
                  {addr.addressType}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(addr)}
                  className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeletingId(addr.id);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-luxury-muted space-y-1">
              <p className="text-white">
                {addr.addressLine1}
                {addr.addressLine2 && `, ${addr.addressLine2}`}
              </p>
              {addr.landmark && <p>Landmark: {addr.landmark}</p>}
              <p>
                {addr.city}, {addr.state} - <span className="font-mono text-white">{addr.pincode}</span>
              </p>
              <p className="font-mono pt-1 text-luxury-gold-light">Phone: {addr.phone}</p>
            </div>

            {addr.isDefault && (
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-luxury-gold font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primary Delivery Address</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add Delivery Address'}
        subtitle="Ensure postal pincode matches registered courier zones."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Recipient Name *"
              placeholder="e.g. Lady Genevieve"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone *"
              placeholder="+91 9988776655"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Street Address / Mansion / Apt *"
            placeholder="Penthouse 4B, Imperial Towers"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
          />

          <Input
            label="Address Line 2 (Optional)"
            placeholder="Altamount Road, Cumballa Hill"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City *"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="State *"
              placeholder="Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="PIN Code (6 Digits) *"
              placeholder="400026"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Landmark"
              placeholder="Near Grand Hotel"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
            <Select
              label="Location Type"
              value={addressType}
              onChange={(e) => setAddressType(e.target.value)}
            >
              <option value="HOME">HOME (Residential)</option>
              <option value="WORK">WORK (Commercial Office)</option>
              <option value="OTHER">OTHER (Salon / Private Estate)</option>
            </Select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-white pt-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
            />
            <span>Set as Default White-Glove Dispatch Address</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-luxury-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSaving}>
              {editingAddress ? 'Save Changes' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Address"
        message="Are you sure you want to remove this delivery location?"
        confirmText="Delete Address"
      />
    </div>
  );
}
