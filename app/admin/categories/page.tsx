'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  ChevronRight,
  Sparkles,
  Search,
  Eye,
  CheckCircle,
  XCircle,
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

export default function CategoriesPage() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formSortOrder, setFormSortOrder] = useState('0');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      } else {
        error(data.error || 'Failed to fetch categories');
      }
    } catch {
      error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImage('');
    setFormParentId('');
    setFormSortOrder('0');
    setFormStatus('ACTIVE');
    setFormIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormImage(cat.image || '');
    setFormParentId(cat.parentId || '');
    setFormSortOrder(String(cat.sortOrder || 0));
    setFormStatus(cat.status);
    setFormIsFeatured(cat.isFeatured);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formName,
      slug: formSlug || slugify(formName),
      description: formDescription || null,
      image: formImage || null,
      parentId: formParentId || null,
      sortOrder: parseInt(formSortOrder, 10) || 0,
      status: formStatus,
      isFeatured: formIsFeatured,
    };

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(editingCategory ? 'Category updated' : 'Category created');
        setIsModalOpen(false);
        fetchCategories();
      } else {
        error(data.error || 'Failed to save category');
      }
    } catch {
      error('Network error saving category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Category deleted successfully');
        setIsDeleteDialogOpen(false);
        fetchCategories();
      } else {
        error(data.error || 'Failed to delete category');
      }
    } catch {
      error('Network error deleting category');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Root categories for hierarchy tree
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Category Architecture
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Dynamic category tree supporting unlimited parent-child nesting across all future lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-luxury-surface/50 border border-luxury-border p-1 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-luxury-gold text-luxury-darkest font-semibold' : 'text-luxury-muted hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'tree' ? 'bg-luxury-gold text-luxury-darkest font-semibold' : 'text-luxury-muted hover:text-white'
              }`}
            >
              Hierarchy Tree
            </button>
          </div>

          <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-luxury-card/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
        </div>
      </div>

      {/* Main View Display */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <Card className="p-0 overflow-hidden">
          {filteredCategories.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-8 h-8" />}
              title="No Categories Found"
              description="Create the primary category to structure your product catalogue."
              action={
                <Button variant="gold" size="sm" onClick={openCreateModal}>
                  Create First Category
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-luxury-emerald/60 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <Layers className="w-4 h-4 text-luxury-gold" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs">{cat.name}</div>
                          {cat.description && (
                            <div className="text-[11px] text-luxury-muted truncate max-w-xs">
                              {cat.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cat.parent ? (
                        <span className="text-xs text-luxury-gold-light font-medium flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-luxury-muted" />
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-xs text-luxury-muted italic">Root Category</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-luxury-muted">{cat.slug}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-bold text-white">{cat._count?.products || 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-luxury-muted">{cat.sortOrder}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cat.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
                        {cat.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingCategory(cat);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Category"
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
      ) : (
        /* Hierarchy Tree View */
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-luxury-border">
            <FolderTree className="w-5 h-5 text-luxury-gold" />
            <h3 className="text-sm font-bold font-brand text-white">Interactive Category Tree</h3>
          </div>

          <div className="space-y-2 pl-2">
            {rootCategories.map((root) => (
              <div key={root.id} className="p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-luxury-gold" />
                    <span className="text-sm font-bold text-white">{root.name}</span>
                    <Badge variant="gold" size="sm">{root._count?.products || 0} Products</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(root)}
                      className="text-xs text-luxury-muted hover:text-luxury-gold"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Direct Children */}
                {root.children && root.children.length > 0 && (
                  <div className="pl-6 space-y-2 border-l-2 border-luxury-gold/30 ml-2 pt-1">
                    {root.children.map((child: any) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-luxury-darkest/60 border border-luxury-border/60"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-luxury-gold" />
                          <span className="text-xs font-semibold text-luxury-gold-light">{child.name}</span>
                          <span className="text-[10px] text-luxury-muted font-mono">{child.slug}</span>
                        </div>
                        <button
                          onClick={() => {
                            const fullCat = categories.find((c) => c.id === child.id);
                            if (fullCat) openEditModal(fullCat);
                          }}
                          className="text-xs text-luxury-muted hover:text-luxury-gold"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        subtitle="Configure category details, parent hierarchy, and SEO properties."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. Serums & Treatments"
            value={formName}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              placeholder="serums-and-treatments"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              helperText="Auto-generated from name if blank"
            />

            <Select
              label="Parent Category (Optional)"
              value={formParentId}
              onChange={(e) => setFormParentId(e.target.value)}
            >
              <option value="">None (Top Level Root Category)</option>
              {categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent ? `${c.parent.name} → ${c.name}` : c.name}
                  </option>
                ))}
            </Select>
          </div>

          <Textarea
            label="Category Description"
            placeholder="Luxury botanical formulations..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
          />

          {/* Image Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
              Category Image
            </label>
            <div className="flex items-center gap-3">
              {formImage ? (
                <div className="w-12 h-12 rounded-xl bg-luxury-surface border border-luxury-gold/40 overflow-hidden relative group">
                  <img src={formImage} alt="Category" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaPickerOpen(true)}
              >
                {formImage ? 'Change Image' : 'Pick from Media Library'}
              </Button>
              {formImage && (
                <button
                  type="button"
                  onClick={() => setFormImage('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Sort Order"
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(e.target.value)}
            />

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
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
                />
                <span>Highlight in Navigation</span>
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? If there are any associated products, the deletion will be safely rejected.`}
        confirmText="Delete Category"
        isLoading={isDeleting}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setFormImage(url)}
        folder="categories"
      />
    </div>
  );
}
