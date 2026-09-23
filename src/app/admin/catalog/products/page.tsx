"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Upload,
  ArrowUpRight,
  Eye,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  modelNumber?: string;
  categoryId: string;
  subcategoryId: string;
  brandId: string;
  category?: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  mrp: number;
  sellingPrice: number;
  purchasePrice?: number;
  discountPercent: number;
  gstPercent: number;
  stock: number;
  status: string;
  warrantyMonths: number;
  returnPolicyDays: number;
  shortDescription?: string;
  fullDescription?: string;
  images?: { id?: string; url: string; isPrimary?: boolean }[];
}

export default function AdminProductsCatalogPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Edit / Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formSubcategoryId, setFormSubcategoryId] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState("");
  const [formPurchasePrice, setFormPurchasePrice] = useState("");
  const [formStock, setFormStock] = useState("10");
  const [formStatus, setFormStatus] = useState("PUBLISHED");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formWarrantyMonths, setFormWarrantyMonths] = useState("12");
  const [formReturnDays, setFormReturnDays] = useState("7");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formFullDesc, setFormFullDesc] = useState("");

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch("/api/v1/products?limit=100&status=ALL"),
        fetch("/api/v1/categories"),
        fetch("/api/v1/brands"),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const brandData = await brandRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) setCategories(catData.categories || []);
      if (brandData.success) setBrands(brandData.brands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories based on chosen category in form
  const availableSubcategories =
    categories.find((c) => c.id === formCategoryId)?.subcategories || [];

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormError("");

    setFormName("");
    setFormSku(`AUR-${Date.now().toString().slice(-6)}`);
    setFormModel("");
    const defaultCat = categories[0]?.id || "";
    setFormCategoryId(defaultCat);
    const defaultSub = categories[0]?.subcategories?.[0]?.id || "";
    setFormSubcategoryId(defaultSub);
    setFormBrandId(brands[0]?.id || "");
    setFormMrp("");
    setFormSellingPrice("");
    setFormPurchasePrice("");
    setFormStock("10");
    setFormStatus("PUBLISHED");
    setFormImageUrl("https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600");
    setFormWarrantyMonths("12");
    setFormReturnDays("7");
    setFormShortDesc("");
    setFormFullDesc("");

    setModalOpen(true);
  };

  const handleOpenEditModal = (p: ProductItem) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormError("");

    setFormName(p.name);
    setFormSku(p.sku);
    setFormModel(p.modelNumber || "");
    setFormCategoryId(p.categoryId);
    setFormSubcategoryId(p.subcategoryId);
    setFormBrandId(p.brandId);
    setFormMrp(p.mrp?.toString() || "");
    setFormSellingPrice(p.sellingPrice?.toString() || "");
    setFormPurchasePrice(p.purchasePrice?.toString() || "");
    setFormStock(p.stock?.toString() || "0");
    setFormStatus(p.status || "PUBLISHED");
    setFormImageUrl(p.images?.[0]?.url || "");
    setFormWarrantyMonths(p.warrantyMonths?.toString() || "12");
    setFormReturnDays(p.returnPolicyDays?.toString() || "7");
    setFormShortDesc(p.shortDescription || "");
    setFormFullDesc(p.fullDescription || "");

    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim() || !formCategoryId || !formSubcategoryId || !formBrandId || !formMrp || !formSellingPrice) {
      setFormError("Please fill all mandatory fields (Name, Category, Subcategory, Brand, MRP, Selling Price).");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        // PUT update
        const res = await fetch(`/api/v1/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            sku: formSku.trim(),
            modelNumber: formModel.trim() || undefined,
            categoryId: formCategoryId,
            subcategoryId: formSubcategoryId,
            brandId: formBrandId,
            mrp: formMrp,
            sellingPrice: formSellingPrice,
            purchasePrice: formPurchasePrice || undefined,
            stock: formStock,
            status: formStatus,
            warrantyMonths: formWarrantyMonths,
            returnPolicyDays: formReturnDays,
            shortDescription: formShortDesc.trim() || undefined,
            fullDescription: formFullDesc.trim() || undefined,
            imageUrl: formImageUrl.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          setSuccessToast("Product updated successfully!");
          fetchData();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          setFormError(data.error || "Update failed.");
        }
      } else {
        // POST create
        const res = await fetch("/api/v1/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            sku: formSku.trim(),
            modelNumber: formModel.trim() || undefined,
            categoryId: formCategoryId,
            subcategoryId: formSubcategoryId,
            brandId: formBrandId,
            mrp: formMrp,
            sellingPrice: formSellingPrice,
            purchasePrice: formPurchasePrice || undefined,
            stock: formStock,
            status: formStatus,
            warrantyMonths: formWarrantyMonths,
            returnPolicyDays: formReturnDays,
            shortDescription: formShortDesc.trim() || undefined,
            fullDescription: formFullDesc.trim() || undefined,
            images: formImageUrl.trim() ? [{ url: formImageUrl.trim() }] : [],
          }),
        });

        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          setSuccessToast("New product created successfully!");
          fetchData();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          setFormError(data.error || "Creation failed.");
        }
      }
    } catch (err: any) {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickToggleStatus = async (p: ProductItem) => {
    const nextStatus = p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/v1/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, status: nextStatus } : item))
        );
        setSuccessToast(`Product status changed to ${nextStatus}`);
        setTimeout(() => setSuccessToast(""), 2500);
      }
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        setSuccessToast(data.message || "Product removed.");
        fetchData();
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

  // Filter products locally for instantaneous UI response
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;

    const matchesStatus =
      selectedStatus === "ALL" || p.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark border border-brand-gold text-brand-gold-light px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {successToast}
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark font-luxury">
            Catalog Master Products ({filteredProducts.length}/{products.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full marketplace catalog management with live editing, pricing, and inventory control
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            title="Refresh Catalog"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/approval"
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            Approval Workflow
          </Link>

          <Link
            href="/admin/bulk-upload"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-emerald text-brand-gold-light border border-brand-gold/40 rounded-xl text-xs font-bold hover:bg-brand-dark transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-brand-gold" />
            Bulk CSV Upload
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-xs shadow-md hover:shadow-gold-glow transition uppercase font-luxury tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold text-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-brand-gold/40"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-brand-gold/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Product &amp; SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Selling / MRP</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
                    Loading marketplace catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
                          }
                          alt={p.name}
                          className="w-12 h-12 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1 hover:text-brand-gold-dark transition">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="font-mono font-bold">SKU: {p.sku}</span>
                            {p.modelNumber && <span>• Mod: {p.modelNumber}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700 font-medium">
                      <span>{p.category?.name || "Uncategorized"}</span>
                      {p.subcategory && (
                        <span className="block text-[10px] text-slate-400">
                          {p.subcategory.name}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-brand-emerald">
                      {p.brand?.name || "Generic"}
                    </td>

                    <td className="p-4">
                      <span className="font-black text-slate-900 text-sm">
                        ₹{p.sellingPrice?.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="line-through text-slate-400">
                          ₹{p.mrp?.toLocaleString()}
                        </span>
                        {p.discountPercent > 0 && (
                          <span className="font-bold text-emerald-600">
                            ({p.discountPercent}% off)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                          p.stock > 10
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : p.stock > 0
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleQuickToggleStatus(p)}
                        title="Click to toggle status"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                          p.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : p.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                            : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-brand-dark transition"
                          title="Edit Product Details &amp; Price"
                        >
                          <Edit2 className="w-4 h-4 text-brand-dark" />
                        </button>

                        <a
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-brand-blue transition"
                          title="View Live Product Page"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-dark to-brand-emerald text-white p-5 flex items-center justify-between border-b border-brand-gold/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-light font-luxury">
                  {isEditing ? "Catalog Master Management" : "New Catalog Entry"}
                </span>
                <h3 className="text-lg font-black font-luxury">
                  {isEditing ? "Edit Product Details & Pricing" : "Create New Marketplace Product"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
                  {formError}
                </div>
              )}

              {/* Basic Details Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-dark uppercase tracking-wider text-[11px] font-luxury pb-1 border-b border-slate-100">
                  1. Identification &amp; Taxonomy
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sony Bravia 55-inch XR OLED 4K Smart Google TV"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. AUR-TV-55-OLED"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manufacturer Model No</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="e.g. XR-55A80L"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      required
                      value={formCategoryId}
                      onChange={(e) => {
                        setFormCategoryId(e.target.value);
                        const parent = categories.find((c) => c.id === e.target.value);
                        setFormSubcategoryId(parent?.subcategories?.[0]?.id || "");
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subcategory *</label>
                    <select
                      required
                      value={formSubcategoryId}
                      onChange={(e) => setFormSubcategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                    >
                      {availableSubcategories.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
                    <select
                      required
                      value={formBrandId}
                      onChange={(e) => setFormBrandId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-brand-dark uppercase tracking-wider text-[11px] font-luxury pb-1 border-b border-slate-100">
                  2. Pricing &amp; Stock Levels
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(e.target.value)}
                      placeholder="e.g. 149990"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">MRP Ceiling (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formMrp}
                      onChange={(e) => setFormMrp(e.target.value)}
                      placeholder="e.g. 189990"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Purchase / Cost (₹)</label>
                    <input
                      type="number"
                      value={formPurchasePrice}
                      onChange={(e) => setFormPurchasePrice(e.target.value)}
                      placeholder="e.g. 125000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Available Stock *</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Media */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-brand-dark uppercase tracking-wider text-[11px] font-luxury pb-1 border-b border-slate-100">
                  3. Image, Status &amp; Assurances
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  {formImageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-contain rounded-xl border p-1 bg-white"
                        onError={(e) => ((e.target as any).style.display = "none")}
                      />
                      <span className="text-[11px] text-slate-400">Live preview of selected image</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Listing Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                    >
                      <option value="PUBLISHED">Published (Storefront Live)</option>
                      <option value="DRAFT">Draft (Internal Only)</option>
                      <option value="SUBMITTED">Submitted for Review</option>
                      <option value="ARCHIVED">Archived (Delisted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Warranty (Months)</label>
                    <input
                      type="number"
                      value={formWarrantyMonths}
                      onChange={(e) => setFormWarrantyMonths(e.target.value)}
                      placeholder="12"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Return Window (Days)</label>
                    <input
                      type="number"
                      value={formReturnDays}
                      onChange={(e) => setFormReturnDays(e.target.value)}
                      placeholder="7"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Description / Key Highlights</label>
                  <textarea
                    rows={2}
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    placeholder="e.g. Cognitive Processor XR, 120Hz Refresh Rate, Acoustic Surface Audio+..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl shadow-md hover:shadow-gold-glow transition uppercase font-luxury tracking-wider disabled:opacity-50"
                >
                  {submitting ? "Saving Product..." : isEditing ? "Update Product" : "Create Product"}
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
              <h3 className="text-base font-bold text-slate-900 font-luxury">Confirm Product Deletion</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{deleteTarget.name}</strong> (SKU: {deleteTarget.sku})?
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                Note: If this product has historical orders, it will be safely marked as <strong>ARCHIVED</strong> to preserve order and invoice records.
              </p>
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
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
