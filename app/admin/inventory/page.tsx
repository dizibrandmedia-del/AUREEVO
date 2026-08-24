'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Building2,
  Sliders,
  History,
  CheckCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';

export default function InventoryPage() {
  const { success, error } = useToast();
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [adjustAction, setAdjustAction] = useState<
    'ADJUSTMENT' | 'RESTOCK' | 'DAMAGE' | 'RETURN' | 'AUDIT'
  >('ADJUSTMENT');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedWarehouseId) query.set('warehouseId', selectedWarehouseId);
      if (filterType !== 'all') query.set('filter', filterType);

      const res = await fetch(`/api/admin/inventory?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInventoryList(data.data.inventory);
      } else {
        error(data.error || 'Failed to fetch inventory');
      }
    } catch {
      error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/warehouses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWarehouses(data.data.warehouses);
      });
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [search, selectedWarehouseId, filterType]);

  const openAdjustModal = (item: any) => {
    setSelectedItem(item);
    setNewQuantity(String(item.currentStock));
    setAdjustAction('RESTOCK');
    setAdjustReason('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!adjustReason || adjustReason.trim().length < 3) {
      error('Please provide an adjustment reason for audit records');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedItem.productId,
          variantId: selectedItem.variantId || null,
          warehouseId: selectedItem.warehouseId,
          newQty: parseInt(newQuantity, 10) || 0,
          action: adjustAction,
          reason: adjustReason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Stock updated and recorded in audit log');
        setIsAdjustModalOpen(false);
        fetchInventory();
      } else {
        error(data.error || 'Failed to adjust stock');
      }
    } catch {
      error('Adjustment error');
    } finally {
      setIsSaving(false);
    }
  };

  const diffPreview =
    selectedItem && newQuantity !== ''
      ? (parseInt(newQuantity, 10) || 0) - selectedItem.currentStock
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Live Stock Matrix
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Real-time physical inventory, warehouse reservations, and audit-logged adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/inventory/history">
            <Button variant="outline" size="sm" leftIcon={<History className="w-4 h-4" />}>
              Stock History Audit
            </Button>
          </Link>
          <Button variant="emerald" size="sm" onClick={fetchInventory} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-luxury-card/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
        </div>

        <select
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
          className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.code})
            </option>
          ))}
        </select>

        <div className="sm:col-span-2 flex rounded-xl bg-luxury-surface/50 border border-luxury-border p-1 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              filterType === 'all' ? 'bg-luxury-gold text-luxury-darkest font-semibold' : 'text-luxury-muted hover:text-white'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setFilterType('low_stock')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              filterType === 'low_stock' ? 'bg-amber-500 text-black font-semibold' : 'text-luxury-muted hover:text-amber-300'
            }`}
          >
            Low Stock Alerts
          </button>
          <button
            onClick={() => setFilterType('out_of_stock')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              filterType === 'out_of_stock' ? 'bg-rose-500 text-white font-semibold' : 'text-luxury-muted hover:text-rose-300'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {inventoryList.length === 0 ? (
            <EmptyState
              icon={<Boxes className="w-8 h-8" />}
              title="No Inventory Records Match Filter"
              description="All product items have healthy stock levels or adjust your filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product / Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Physical Stock</TableHead>
                  <TableHead className="text-center">Reserved</TableHead>
                  <TableHead className="text-center">Available Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-white text-xs">{item.productName}</div>
                      {item.variantName ? (
                        <div className="text-[11px] text-luxury-gold-light">{item.variantName}</div>
                      ) : (
                        <div className="text-[11px] text-luxury-muted">{item.categoryName}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-luxury-muted">{item.sku}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-luxury-gold" />
                        <span>{item.warehouseName}</span>
                      </div>
                      <span className="text-[10px] text-luxury-muted font-mono">{item.warehouseCode}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-white">{item.currentStock}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-luxury-muted">{item.reservedStock}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm font-bold ${
                          item.availableStock <= 0
                            ? 'text-rose-400'
                            : item.availableStock <= item.lowStockThreshold
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {item.availableStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.stockStatus === 'OUT_OF_STOCK' ? (
                        <Badge variant="rose">Out of Stock</Badge>
                      ) : item.stockStatus === 'LOW_STOCK' ? (
                        <Badge variant="amber">Low Stock</Badge>
                      ) : (
                        <Badge variant="emerald">Healthy</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => openAdjustModal(item)}
                        leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Execute Stock Adjustment"
        subtitle={`Adjust inventory for ${selectedItem?.productName} (${selectedItem?.sku})`}
        maxWidth="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-luxury-surface/40 border border-luxury-border flex items-center justify-between text-xs">
            <div>
              <span className="text-luxury-muted block">Current Physical Quantity:</span>
              <span className="text-lg font-bold text-white">{selectedItem?.currentStock} units</span>
            </div>
            <div className="text-right">
              <span className="text-luxury-muted block">Warehouse:</span>
              <span className="text-xs font-semibold text-luxury-gold-light">
                {selectedItem?.warehouseName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Quantity *"
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              required
            />

            <Select
              label="Adjustment Action *"
              value={adjustAction}
              onChange={(e) => setAdjustAction(e.target.value as any)}
            >
              <option value="RESTOCK">RESTOCK (Inbound Supply)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Manual Correction)</option>
              <option value="AUDIT">AUDIT (Physical Count Reconciliation)</option>
              <option value="DAMAGE">DAMAGE (Damaged / Expired Write-off)</option>
              <option value="RETURN">RETURN (Customer Return Intake)</option>
            </Select>
          </div>

          {/* Delta Preview Pill */}
          <div className="p-2.5 rounded-lg bg-luxury-dark/90 border border-luxury-border text-xs flex items-center justify-between">
            <span className="text-luxury-muted">Net Stock Impact:</span>
            <span
              className={`font-bold font-mono ${
                diffPreview > 0 ? 'text-emerald-400' : diffPreview < 0 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {diffPreview > 0 ? `+${diffPreview}` : diffPreview} Units
            </span>
          </div>

          <Textarea
            label="Mandatory Audit Reason *"
            placeholder="e.g. Received shipment container from Swiss Lab PO #8902"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            rows={2}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdjustModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSaving}>
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
