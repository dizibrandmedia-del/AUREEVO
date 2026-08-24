'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Globe,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import { slugify } from '@/lib/utils';

export default function BrandsPage() {
  const { success, error } = useToast();
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formBanner, setFormBanner] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (data.success) {
        setBrands(data.data.brands);
      } else {
        error(data.error || 'Failed to fetch brands');
      }
    } catch {
      error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormName('');
    setFormSlug('');
    setFormLogo('');
    setFormBanner('');
    setFormWebsite('');
    setFormDescription('');
    setFormStatus('ACTIVE');
    setFormIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: any) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormLogo(brand.logo || '');
    setFormBanner(brand.banner || '');
    setFormWebsite(brand.website || '');
    setFormDescription(brand.description || '');
    setFormStatus(brand.status);
    setFormIsFeatured(brand.isFeatured);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingBrand) {
      setFormSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formName,
      slug: formSlug || slugify(formName),
      logo: formLogo || null,
      banner: formBanner || null,
      website: formWebsite || null,
      description: formDescription || null,
      status: formStatus,
      isFeatured: formIsFeatured,
    };

    try {
      const url = editingBrand
        ? `/api/admin/brands/${editingBrand.id}`
        : '/api/admin/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(editingBrand ? 'Brand updated' : 'Brand created');
        setIsModalOpen(false);
        fetchBrands();
      } else {
        error(data.error || 'Failed to save brand');
      }
    } catch {
      error('Network error saving brand');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/brands/${deletingBrand.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Brand deleted successfully');
        setIsDeleteDialogOpen(false);
        fetchBrands();
      } else {
        error(data.error || 'Failed to delete brand');
      }
    } catch {
      error('Network error deleting brand');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Brand Portfolio
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Manage luxury partner houses, in-house labels, and brand identity metadata.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Brand
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search brands by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-luxury-card/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
        </div>
      </div>

      {/* Brands Table View */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {filteredBrands.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-8 h-8" />}
              title="No Brands Registered"
              description="Add luxury partner brands to associate with products."
              action={
                <Button variant="gold" size="sm" onClick={openCreateModal}>
                  Create First Brand
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Official Website</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-luxury-emerald/60 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-luxury-gold" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                            <span>{brand.name}</span>
                            {brand.isFeatured && (
                              <Badge variant="gold" size="sm">Featured</Badge>
                            )}
                          </div>
                          {brand.description && (
                            <div className="text-[11px] text-luxury-muted truncate max-w-xs">
                              {brand.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-luxury-muted">{brand.slug}</span>
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-luxury-gold-light hover:text-luxury-gold inline-flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[140px]">{brand.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-luxury-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                        <Package className="w-3.5 h-3.5 text-luxury-gold" />
                        {brand._count?.products || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={brand.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
                        {brand.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                          title="Edit Brand"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingBrand(brand);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Brand"
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

      {/* Add / Edit Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Register Luxury Brand'}
        subtitle="Configure brand credentials, insignia logo, and digital showcase."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Brand Name *"
            placeholder="e.g. L'Élixir Royale"
            value={formName}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              placeholder="lelixir-royale"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              helperText="Auto-generated from name if blank"
            />

            <Input
              label="Official Website"
              placeholder="https://brand.com"
              value={formWebsite}
              onChange={(e) => setFormWebsite(e.target.value)}
            />
          </div>

          <Textarea
            label="Brand Heritage / Description"
            placeholder="French haute perfumery specializing in rare aged resins..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
          />

          {/* Logo Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
              Brand Insignia / Logo
            </label>
            <div className="flex items-center gap-3">
              {formLogo ? (
                <div className="w-12 h-12 rounded-xl bg-luxury-surface border border-luxury-gold/40 p-1 flex items-center justify-center">
                  <img src={formLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaPickerOpen(true)}
              >
                {formLogo ? 'Change Insignia' : 'Select from Media Library'}
              </Button>
              {formLogo && (
                <button
                  type="button"
                  onClick={() => setFormLogo('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Select
              label="Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
                Featured Brand
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
                />
                <span>Showcase in Brand Spotlight</span>
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
              {editingBrand ? 'Save Changes' : 'Register Brand'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deletingBrand?.name}"? Deletion is permitted only if no products are linked.`}
        confirmText="Delete Brand"
        isLoading={isDeleting}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setFormLogo(url)}
        folder="brands"
      />
    </div>
  );
}
