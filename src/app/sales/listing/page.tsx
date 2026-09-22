"use client";

import React, { useState, useEffect } from "react";
import {
  PlusSquare,
  CheckCircle2,
  Clock,
  Layers,
  Upload,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export default function ProductListingDeskPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Product form
  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [mrp, setMrp] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specName, setSpecName] = useState("Screen Size");
  const [specValue, setSpecValue] = useState("55 inch");

  const loadData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch("/api/v1/products?limit=100");
      const pData = await pRes.json();
      if (pData.success) setProducts(pData.products || []);

      const cRes = await fetch("/api/v1/categories");
      const cData = await cRes.json();
      if (cData.success) {
        setCategories(cData.categories || []);
        if (cData.categories.length > 0) {
          setCategoryId(cData.categories[0].id);
          if (cData.categories[0].subcategories?.length > 0) {
            setSubcategoryId(cData.categories[0].subcategories[0].id);
          }
        }
      }

      const bRes = await fetch("/api/v1/brands");
      const bData = await bRes.json();
      if (bData.success) {
        setBrands(bData.brands || []);
        if (bData.brands.length > 0) setBrandId(bData.brands[0].id);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat?.subcategories?.length > 0) {
      setSubcategoryId(cat.subcategories[0].id);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !subcategoryId || !brandId || !mrp || !sellingPrice) {
      alert("Please fill in all mandatory product details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          modelNumber,
          sku: sku || `AUR-EXE-${Date.now().toString().slice(-6)}`,
          categoryId,
          subcategoryId,
          brandId,
          mrp: parseFloat(mrp),
          sellingPrice: parseFloat(sellingPrice),
          stock: parseInt(stock, 10),
          shortDescription: shortDesc,
          fullDescription: fullDesc,
          images: [imageUrl || "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"],
          attributes: [{ attributeName: specName, attributeValue: specValue }],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Product draft submitted successfully for Admin Approval!");
        setModalOpen(false);
        loadData();
        setName("");
        setModelNumber("");
        setMrp("");
        setSellingPrice("");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        alert(data.error || "Failed to submit product.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Product Listing Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: Listing Executive • Create drafts & submit specifications for Admin Approval
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-violet hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <PlusSquare className="w-4 h-4" /> Add & Submit New Product
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Product Submission Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Product Name & SKU</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">Selling Price / MRP</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Workflow Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
                      }
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded border p-1"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-bold text-brand-blue">{p.brand?.name}</td>
                <td className="p-4 text-slate-700">{p.category?.name}</td>
                <td className="p-4 font-extrabold text-slate-900">
                  ₹{p.sellingPrice.toLocaleString()}{" "}
                  <span className="text-[10px] text-slate-400 font-normal line-through">
                    ₹{p.mrp.toLocaleString()}
                  </span>
                </td>
                <td className="p-4 text-slate-700 font-medium">{p.stock} units</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : p.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.rejectionReason && (
                    <span className="block text-[10px] text-red-500 mt-0.5">
                      {p.rejectionReason}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-dropdown border border-slate-100 space-y-4 text-xs my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Submit Product Listing to Admin Approval Queue
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sony 65-inch Bravia 4K Google TV"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="e.g. KD-65X74L"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="e.g. SON-TV-65-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
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
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {currentCategory?.subcategories?.map((sc: any) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inventory Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="e.g. 54990"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Key Spec Name</label>
                  <input
                    type="text"
                    value={specName}
                    onChange={(e) => setSpecName(e.target.value)}
                    placeholder="e.g. Screen Size / Capacity"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Key Spec Value</label>
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="e.g. 65 inch / 1.5 Ton"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  placeholder="Key features, warranty coverage, and packaging details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-brand-violet text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit for Admin Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
