"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Percent,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  FolderPlus,
} from "lucide-react";

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories: SubcategoryItem[];
  marginRule?: {
    defaultMarginPercent: number;
    otherCostPercent: number;
    minMarginPercent: number;
  };
  _count: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catMargin, setCatMargin] = useState("15");
  const [catOtherCost, setCatOtherCost] = useState("3");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState("");

  // Subcategory Modal State
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [parentCatId, setParentCatId] = useState("");
  const [parentCatName, setParentCatName] = useState("");
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [subError, setSubError] = useState("");

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    isSubcategory: boolean;
    productCount?: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/categories?all=true");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddCategory = () => {
    setIsEditingCat(false);
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatMargin("15");
    setCatOtherCost("3");
    setCatError("");
    setCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setIsEditingCat(true);
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || "");
    setCatMargin(cat.marginRule?.defaultMarginPercent?.toString() || "15");
    setCatOtherCost(cat.marginRule?.otherCostPercent?.toString() || "3");
    setCatError("");
    setCatModalOpen(true);
  };

  const handleOpenAddSubcategory = (cat: CategoryItem) => {
    setParentCatId(cat.id);
    setParentCatName(cat.name);
    setSubName("");
    setSubSlug("");
    setSubError("");
    setSubModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");

    if (!catName.trim()) {
      setCatError("Category name is required.");
      return;
    }

    setCatSubmitting(true);
    try {
      if (isEditingCat && editingCatId) {
        // PUT update
        const res = await fetch("/api/v1/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCatId,
            name: catName.trim(),
            slug: catSlug.trim() || undefined,
            description: catDesc.trim() || undefined,
            defaultMarginPercent: catMargin,
            otherCostPercent: catOtherCost,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCatModalOpen(false);
          setSuccessToast("Category updated successfully!");
          loadCategories();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          setCatError(data.error || "Update failed.");
        }
      } else {
        // POST create
        const res = await fetch("/api/v1/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: catName.trim(),
            slug: catSlug.trim() || undefined,
            description: catDesc.trim() || undefined,
            defaultMarginPercent: catMargin,
            otherCostPercent: catOtherCost,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCatModalOpen(false);
          setSuccessToast("New category created successfully!");
          loadCategories();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          setCatError(data.error || "Creation failed.");
        }
      }
    } catch (err) {
      setCatError("Network error.");
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError("");

    if (!subName.trim() || !parentCatId) {
      setSubError("Subcategory name is required.");
      return;
    }

    setSubSubmitting(true);
    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isSubcategory: true,
          categoryId: parentCatId,
          name: subName.trim(),
          slug: subSlug.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubModalOpen(false);
        setSuccessToast(`Subcategory "${subName}" added!`);
        loadCategories();
        setTimeout(() => setSuccessToast(""), 3000);
      } else {
        setSubError(data.error || "Failed to create subcategory.");
      }
    } catch (err) {
      setSubError("Network error.");
    } finally {
      setSubSubmitting(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/v1/categories?id=${deleteTarget.id}&isSubcategory=${deleteTarget.isSubcategory}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        setSuccessToast(data.message || "Deleted successfully.");
        loadCategories();
        setTimeout(() => setSuccessToast(""), 3000);
      } else {
        alert(data.error || "Delete failed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark border border-brand-gold text-brand-gold-light px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark font-luxury">
            Categories &amp; Subcategory Taxonomy ({categories.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical marketplace classification with product counts and target margin rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAddCategory}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-xs shadow-md hover:shadow-gold-glow transition uppercase font-luxury tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
            Loading category taxonomy...
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs hover:border-brand-gold/40 transition"
            >
              {/* Category Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-luxury">
                      {cat.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald font-bold text-[10px]">
                      {cat._count?.products || 0} Products
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    slug: /{cat.slug}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenAddSubcategory(cat)}
                    className="p-1.5 rounded-lg text-brand-emerald hover:bg-brand-emerald/10 transition"
                    title="Add Subcategory under this Category"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-brand-dark transition"
                    title="Edit Category &amp; Margin Rules"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setDeleteTarget({
                        id: cat.id,
                        name: cat.name,
                        isSubcategory: false,
                        productCount: cat._count?.products || 0,
                      })
                    }
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {cat.description && (
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {cat.description}
                </p>
              )}

              {/* Subcategories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Subcategories ({cat.subcategories.length})
                  </span>
                  <button
                    onClick={() => handleOpenAddSubcategory(cat)}
                    className="text-[11px] font-bold text-brand-gold-dark hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Subcategory
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No subcategories defined</span>
                  ) : (
                    cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="group flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200 hover:border-slate-300"
                      >
                        <span>{sub.name}</span>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: sub.id,
                              name: sub.name,
                              isSubcategory: true,
                            })
                          }
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                          title="Delete Subcategory"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Margin Rules */}
              {cat.marginRule && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 bg-brand-gold/5 p-2.5 rounded-xl border border-brand-gold/20">
                  <span className="flex items-center gap-1 font-bold text-brand-dark">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
                    Target Margin: <strong>{cat.marginRule.defaultMarginPercent}%</strong>
                  </span>
                  <span>
                    Overhead Costs: <strong>{cat.marginRule.otherCostPercent}%</strong>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden">
            <div className="bg-gradient-to-r from-brand-dark to-brand-emerald text-white p-5 flex items-center justify-between border-b border-brand-gold/30">
              <h3 className="text-base font-black font-luxury">
                {isEditingCat ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              {catError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
                  {catError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!isEditingCat) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                    }
                  }}
                  placeholder="e.g. Home Appliances"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. home-appliances"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Short description of this product line..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Margin (%)</label>
                  <input
                    type="number"
                    value={catMargin}
                    onChange={(e) => setCatMargin(e.target.value)}
                    placeholder="15"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Overhead Costs (%)</label>
                  <input
                    type="number"
                    value={catOtherCost}
                    onChange={(e) => setCatOtherCost(e.target.value)}
                    placeholder="3"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="px-5 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl shadow-md hover:shadow-gold-glow uppercase font-luxury tracking-wider disabled:opacity-50"
                >
                  {catSubmitting ? "Saving..." : isEditingCat ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUBCATEGORY MODAL */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden">
            <div className="bg-gradient-to-r from-brand-dark to-brand-emerald text-white p-5 flex items-center justify-between border-b border-brand-gold/30">
              <div>
                <span className="text-[10px] text-brand-gold-light font-luxury">Parent: {parentCatName}</span>
                <h3 className="text-base font-black font-luxury">Add Subcategory</h3>
              </div>
              <button
                onClick={() => setSubModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="p-6 space-y-4 text-xs">
              {subError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
                  {subError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => {
                    setSubName(e.target.value);
                    setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }}
                  placeholder="e.g. Front Load Washing Machines"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  placeholder="e.g. front-load-washers"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subSubmitting}
                  className="px-5 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl shadow-md uppercase font-luxury tracking-wider disabled:opacity-50"
                >
                  {subSubmitting ? "Adding..." : "Add Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-luxury">
                Delete {deleteTarget.isSubcategory ? "Subcategory" : "Category"}
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              </p>
              {deleteTarget.productCount && deleteTarget.productCount > 0 ? (
                <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2 font-bold">
                  ⚠️ Warning: {deleteTarget.productCount} product(s) are currently assigned to this category. You must reassign or delete those products before this category can be removed.
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  This action cannot be undone.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirmed}
                disabled={deleting || Boolean(deleteTarget.productCount && deleteTarget.productCount > 0)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
