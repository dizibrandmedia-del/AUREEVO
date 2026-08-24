'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Palette,
  Check,
  X,
  PlusCircle,
  Hash,
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
import { slugify } from '@/lib/utils';

export default function AttributesPage() {
  const { success, error } = useToast();
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Attribute Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<any>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState('SELECT');
  const [formIsFilterable, setFormIsFilterable] = useState(true);
  const [formIsVariant, setFormIsVariant] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState('0');

  // Values Modal State
  const [isValuesModalOpen, setIsValuesModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [newValueLabel, setNewValueLabel] = useState('');
  const [newValueSlug, setNewValueSlug] = useState('');
  const [newValueColor, setNewValueColor] = useState('#d4af37');
  const [isAddingValue, setIsAddingValue] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAttribute, setDeletingAttribute] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAttributes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/attributes');
      const data = await res.json();
      if (data.success) {
        setAttributes(data.data.attributes);
      } else {
        error(data.error || 'Failed to fetch attributes');
      }
    } catch {
      error('Failed to load attributes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const openCreateModal = () => {
    setEditingAttribute(null);
    setFormName('');
    setFormCode('');
    setFormType('SELECT');
    setFormIsFilterable(true);
    setFormIsVariant(false);
    setFormSortOrder('0');
    setIsModalOpen(true);
  };

  const openEditModal = (attr: any) => {
    setEditingAttribute(attr);
    setFormName(attr.name);
    setFormCode(attr.code);
    setFormType(attr.type);
    setFormIsFilterable(attr.isFilterable);
    setFormIsVariant(attr.isVariant);
    setFormSortOrder(String(attr.sortOrder || 0));
    setIsModalOpen(true);
  };

  const openValuesModal = (attr: any) => {
    setSelectedAttribute(attr);
    setNewValueLabel('');
    setNewValueSlug('');
    setNewValueColor('#d4af37');
    setIsValuesModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingAttribute) {
      setFormCode(slugify(val).replace(/-/g, '_'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formName,
      code: formCode || slugify(formName).replace(/-/g, '_'),
      type: formType,
      isFilterable: formIsFilterable,
      isVariant: formIsVariant,
      sortOrder: parseInt(formSortOrder, 10) || 0,
    };

    try {
      const url = editingAttribute
        ? `/api/admin/attributes/${editingAttribute.id}`
        : '/api/admin/attributes';
      const method = editingAttribute ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(editingAttribute ? 'Attribute updated' : 'Attribute created');
        setIsModalOpen(false);
        fetchAttributes();
      } else {
        error(data.error || 'Failed to save attribute');
      }
    } catch {
      error('Network error saving attribute');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttribute || !newValueLabel) return;
    setIsAddingValue(true);

    const payload = {
      attributeId: selectedAttribute.id,
      label: newValueLabel,
      value: newValueSlug || slugify(newValueLabel),
      hexColor: selectedAttribute.type === 'COLOR' ? newValueColor : null,
      sortOrder: (selectedAttribute.values?.length || 0) + 1,
    };

    try {
      const res = await fetch('/api/admin/attributes/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success('Attribute value added');
        setNewValueLabel('');
        setNewValueSlug('');
        fetchAttributes().then(() => {
          // Update selected attribute values in modal view
          setAttributes((prev) => {
            const updated = prev.find((a) => a.id === selectedAttribute.id);
            if (updated) setSelectedAttribute(updated);
            return prev;
          });
        });
      } else {
        error(data.error || 'Failed to add value');
      }
    } catch {
      error('Network error adding value');
    } finally {
      setIsAddingValue(false);
    }
  };

  const handleDeleteValue = async (valId: string) => {
    try {
      const res = await fetch(`/api/admin/attributes/values?id=${valId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Value removed');
        fetchAttributes().then(() => {
          setAttributes((prev) => {
            const updated = prev.find((a) => a.id === selectedAttribute.id);
            if (updated) setSelectedAttribute(updated);
            return prev;
          });
        });
      } else {
        error(data.error || 'Failed to delete value');
      }
    } catch {
      error('Network error deleting value');
    }
  };

  const handleDeleteAttribute = async () => {
    if (!deletingAttribute) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/attributes/${deletingAttribute.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Attribute deleted successfully');
        setIsDeleteDialogOpen(false);
        fetchAttributes();
      } else {
        error(data.error || 'Failed to delete attribute');
      }
    } catch {
      error('Network error deleting attribute');
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
            Dynamic Attributes Engine
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Define dynamic specifications, variant drivers, and storefront filters without writing code.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Attribute
        </Button>
      </div>

      {/* Attributes Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {attributes.length === 0 ? (
            <EmptyState
              icon={<Sliders className="w-8 h-8" />}
              title="No Dynamic Attributes"
              description="Define attributes like Skin Type, Volume, Shade, or Material for product customization."
              action={
                <Button variant="gold" size="sm" onClick={openCreateModal}>
                  Create First Attribute
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Configured Values</TableHead>
                  <TableHead className="text-center">Variant Driver</TableHead>
                  <TableHead className="text-center">Filterable</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell>
                      <div className="font-semibold text-white text-xs">{attr.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-luxury-gold-light bg-luxury-surface/40 px-2 py-0.5 rounded border border-luxury-border">
                        {attr.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{attr.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                        {attr.values && attr.values.length > 0 ? (
                          attr.values.slice(0, 4).map((v: any) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-luxury-emerald/60 border border-luxury-border text-white"
                            >
                              {v.hexColor && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/40"
                                  style={{ backgroundColor: v.hexColor }}
                                />
                              )}
                              <span>{v.label}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-luxury-muted italic">No values defined</span>
                        )}
                        {attr.values && attr.values.length > 4 && (
                          <span className="text-[10px] text-luxury-gold-light">
                            +{attr.values.length - 4} more
                          </span>
                        )}
                        <button
                          onClick={() => openValuesModal(attr)}
                          className="text-[11px] text-luxury-gold hover:underline ml-1 font-medium"
                        >
                          Manage
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {attr.isVariant ? (
                        <Badge variant="gold">Variant</Badge>
                      ) : (
                        <span className="text-luxury-muted text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {attr.isFilterable ? (
                        <Badge variant="emerald">Yes</Badge>
                      ) : (
                        <span className="text-luxury-muted text-xs">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openValuesModal(attr)}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                          title="Manage Values"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(attr)}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                          title="Edit Attribute"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingAttribute(attr);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Attribute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Add / Edit Attribute Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAttribute ? 'Edit Attribute' : 'Create Dynamic Attribute'}
        subtitle="Define specification keys and behavior for catalogue filtering and variants."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Attribute Name *"
            placeholder="e.g. Skin Type, Volume, Shade"
            value={formName}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Attribute Code *"
            placeholder="skin_type"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value)}
            helperText="System identifier (e.g. volume, fragrance_family)"
            required
          />

          <Select
            label="Attribute Input Type"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            <option value="SELECT">Select Dropdown (Single option)</option>
            <option value="MULTISELECT">Multi-select (Multiple checkboxes)</option>
            <option value="COLOR">Color Swatch (Visual color code)</option>
            <option value="TEXT">Freeform Text</option>
            <option value="NUMBER">Numeric Value</option>
            <option value="BOOLEAN">Boolean Toggle (Yes/No)</option>
          </Select>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-luxury-surface/40 border border-luxury-border text-xs text-white">
              <input
                type="checkbox"
                checked={formIsVariant}
                onChange={(e) => setFormIsVariant(e.target.checked)}
                className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
              />
              <span>Generate Product Variants</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-luxury-surface/40 border border-luxury-border text-xs text-white">
              <input
                type="checkbox"
                checked={formIsFilterable}
                onChange={(e) => setFormIsFilterable(e.target.checked)}
                className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
              />
              <span>Include in Search Filters</span>
            </label>
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
              {editingAttribute ? 'Save Changes' : 'Create Attribute'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attribute Values Manager Modal */}
      <Modal
        isOpen={isValuesModalOpen}
        onClose={() => setIsValuesModalOpen(false)}
        title={`Values for: ${selectedAttribute?.name}`}
        subtitle="Add, remove, and color-code options for this attribute."
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Add Value Form */}
          <form onSubmit={handleAddValue} className="p-4 rounded-xl bg-luxury-surface/40 border border-luxury-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">
              Add New Option
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Display Label (e.g. 50ml, Royal Ruby)"
                value={newValueLabel}
                onChange={(e) => setNewValueLabel(e.target.value)}
                required
              />
              <Input
                placeholder="Slug Value (optional)"
                value={newValueSlug}
                onChange={(e) => setNewValueSlug(e.target.value)}
              />
              {selectedAttribute?.type === 'COLOR' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newValueColor}
                    onChange={(e) => setNewValueColor(e.target.value)}
                    className="w-10 h-9 rounded-lg bg-transparent cursor-pointer border border-luxury-border"
                  />
                  <Input
                    placeholder="#d4af37"
                    value={newValueColor}
                    onChange={(e) => setNewValueColor(e.target.value)}
                  />
                </div>
              ) : (
                <Button type="submit" variant="gold" size="sm" isLoading={isAddingValue} className="w-full">
                  Add Option
                </Button>
              )}
            </div>

            {selectedAttribute?.type === 'COLOR' && (
              <div className="flex justify-end pt-1">
                <Button type="submit" variant="gold" size="sm" isLoading={isAddingValue}>
                  Add Color Option
                </Button>
              </div>
            )}
          </form>

          {/* Current Values List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-muted">
              Current Values ({selectedAttribute?.values?.length || 0})
            </h4>

            {selectedAttribute?.values?.length === 0 ? (
              <p className="text-xs text-luxury-muted italic py-4 text-center">
                No values defined yet. Add the first option above.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedAttribute?.values?.map((val: any) => (
                  <div
                    key={val.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-luxury-dark/80 border border-luxury-border text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {val.hexColor && (
                        <div
                          className="w-5 h-5 rounded-full border border-black/40 shadow-sm shrink-0"
                          style={{ backgroundColor: val.hexColor }}
                        />
                      )}
                      <div>
                        <span className="font-semibold text-white">{val.label}</span>
                        <span className="font-mono text-[11px] text-luxury-muted ml-2">
                          ({val.value})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteValue(val.id)}
                      className="p-1 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Remove Option"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAttribute}
        title="Delete Attribute"
        message={`Are you sure you want to delete "${deletingAttribute?.name}"? If any products reference this attribute in specifications, deletion will be rejected.`}
        confirmText="Delete Attribute"
        isLoading={isDeleting}
      />
    </div>
  );
}
