"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  PhoneCall,
  Mail,
  MapPin,
  CheckCircle2,
  FileText,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [city, setCity] = useState("Varanasi");
  const [deliveryArea, setDeliveryArea] = useState("Eastern UP & Bihar");
  const [paymentTerms, setPaymentTerms] = useState("15 Days Credit");
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/suppliers");
      const data = await res.json();
      if (data.success) setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setCompanyName("");
    setPhone("");
    setWhatsapp("");
    setEmail("");
    setGstin("");
    setCity("Varanasi");
    setDeliveryArea("Eastern UP & Bihar");
    setPaymentTerms("15 Days Credit");
    setModalOpen(true);
  };

  const handleOpenEditModal = (s: any) => {
    setIsEditing(true);
    setEditingId(s.id);
    setName(s.name || "");
    setCompanyName(s.companyName || "");
    setPhone(s.phone || "");
    setWhatsapp(s.whatsapp || "");
    setEmail(s.email || "");
    setGstin(s.gstin || "");
    setCity(s.city || "Varanasi");
    setDeliveryArea(s.deliveryArea || "Eastern UP & Bihar");
    setPaymentTerms(s.paymentTerms || "15 Days Credit");
    setModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && editingId) {
        // PUT update
        const res = await fetch("/api/v1/suppliers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name,
            companyName,
            phone,
            whatsapp,
            email,
            gstin,
            city,
            deliveryArea,
            paymentTerms,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          setSuccessToast("Supplier details updated!");
          loadSuppliers();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          alert(data.error || "Failed to update supplier");
        }
      } else {
        // POST create
        const res = await fetch("/api/v1/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            companyName,
            phone,
            whatsapp,
            email,
            gstin,
            city,
            deliveryArea,
            paymentTerms,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          setSuccessToast("New supplier registered!");
          loadSuppliers();
          setTimeout(() => setSuccessToast(""), 3000);
        } else {
          alert(data.error || "Failed to create supplier");
        }
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/suppliers?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        setSuccessToast(data.message || "Supplier removed.");
        loadSuppliers();
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
            Authorized Supplier Network ({suppliers.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified distributors, procurement terms, and order fulfilment allocation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSuppliers}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl text-xs shadow-md hover:shadow-gold-glow transition uppercase font-luxury tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add New Supplier
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-gold" />
            Loading supplier directory...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border">
            No authorized suppliers found. Click "+ Add New Supplier" to onboard a partner.
          </div>
        ) : (
          suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs hover:border-brand-gold/40 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-luxury">{s.companyName}</h3>
                  <p className="text-slate-400 text-[11px]">POC: {s.name}</p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>

                  <button
                    onClick={() => handleOpenEditModal(s)}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-dark transition"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  {s.phone} {s.whatsapp && `(WA: ${s.whatsapp})`}
                </p>
                {s.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-emerald" />
                    {s.email}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {s.city || "Pan-India"} • Area: <strong>{s.deliveryArea}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  GSTIN: <strong className="font-mono text-slate-800">{s.gstin || "Pending Verification"}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                <span>Payment: <strong>{s.paymentTerms}</strong></span>
                <span>Orders: <strong>{s._count?.assignedOrders || 0}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-brand-border space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 font-luxury">
                {isEditing ? "Edit Supplier Partner" : "Add Authorized Supplier"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Electronics Distributors"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sanjay Verma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="09AAB..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Area</label>
                  <input
                    type="text"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-brand-dark font-black rounded-xl shadow-md uppercase font-luxury tracking-wider disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isEditing ? "Update Supplier" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-luxury">Confirm Supplier Removal</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{deleteTarget.companyName}</strong> (Contact: {deleteTarget.name})?
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
                onClick={handleDeleteSupplier}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
