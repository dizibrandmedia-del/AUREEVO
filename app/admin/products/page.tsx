'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Duplication State
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        categoryId,
        brandId,
        status,
        page: String(page),
        limit: '15',
      });
      const res = await fetch(`/api/admin/products?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } else {
        error(data.error || 'Failed to fetch products');
      }
    } catch {
      error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.data.categories);
      if (brandRes.success) setBrands(brandRes.data.brands);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId, brandId, status, page]);

  const handleDuplicate = async (productId: string) => {
    setIsDuplicating(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        success('Product duplicated as Draft');
        fetchProducts();
      } else {
        error(data.error || 'Failed to duplicate');
      }
    } catch {
      error('Duplication error');
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Product deleted');
        setIsDeleteDialogOpen(false);
        fetchProducts();
      } else {
        error(data.error || 'Failed to delete');
      }
    } catch {
      error('Delete error');
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
            Product Catalogue
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Manage formulations, pricing matrices, luxury imagery, and inventory associations.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button variant="gold" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Compose Product
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, SKU, or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-luxury-card/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value);
            setPage(1);
          }}
          className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title="No Products Found"
              description="Compose your first luxury formulation to list in the catalogue."
              action={
                <Link href="/admin/products/new">
                  <Button variant="gold" size="sm">
                    Compose Product
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Brand & Category</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead className="text-center">Type / Variants</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const primaryImage = p.images ? JSON.parse(p.images)[0] : null;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-luxury-emerald/60 border border-luxury-border overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                              {primaryImage ? (
                                <img src={primaryImage} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package className="w-5 h-5 text-luxury-gold" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-xs max-w-xs truncate">{p.name}</div>
                              {p.isFeatured && (
                                <Badge variant="gold" size="sm" className="mt-0.5">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-luxury-gold-light">{p.sku}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-white">{p.brand?.name || 'AUREEVO Maison'}</div>
                          <div className="text-[11px] text-luxury-muted">{p.category?.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-white text-xs">
                            ₹{p.sellingPrice.toLocaleString('en-IN')}
                          </div>
                          {p.mrp > p.sellingPrice && (
                            <div className="text-[10px] text-luxury-muted line-through">
                              ₹{p.mrp.toLocaleString('en-IN')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.productType === 'VARIABLE' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-luxury-gold/15 text-luxury-gold-light border border-luxury-gold/30">
                              {p.variants?.length || 0} Variants
                            </span>
                          ) : (
                            <Badge variant="neutral">Simple</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              p.status === 'ACTIVE'
                                ? 'emerald'
                                : p.status === 'DRAFT'
                                ? 'neutral'
                                : 'rose'
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/products/${p.id}/edit`}>
                              <button
                                className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDuplicate(p.id)}
                              disabled={isDuplicating === p.id}
                              className="p-1.5 rounded-lg text-luxury-muted hover:text-white hover:bg-luxury-surface/50 transition-colors"
                              title="Duplicate Product"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingProduct(p);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-luxury-border/60 text-xs text-luxury-muted">
                  <span>
                    Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.totalPages}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Delete Product Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})? This will remove all associated variants and inventory entries.`}
        confirmText="Delete Product"
        isLoading={isDeleting}
      />
    </div>
  );
}
