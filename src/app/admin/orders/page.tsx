"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  FileText,
  Clock,
  Filter,
  Package,
} from "lucide-react";
import { generateInvoicePdf } from "@/lib/invoice";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateSupplierId, setUpdateSupplierId] = useState("");
  const [updateFulfilmentModel, setUpdateFulfilmentModel] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const ordRes = await fetch(`/api/v1/orders${statusFilter ? `?status=${statusFilter}` : ""}`);
      const ordData = await ordRes.json();
      if (ordData.success) setOrders(ordData.orders || []);

      const supRes = await fetch("/api/v1/suppliers");
      const supData = await supRes.json();
      if (supData.success) setSuppliers(supData.suppliers || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenManage = (order: any) => {
    setSelectedOrder(order);
    setUpdateStatus(order.orderStatus);
    setUpdateSupplierId(order.supplierId || "");
    setUpdateFulfilmentModel(order.fulfilmentModel || "LOCAL_SUPPLIER_LOCAL_DELIVERY");
    setTrackingNumber(order.shipments?.[0]?.trackingNumber || "");
  };

  const handleSaveFulfilment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: updateStatus,
          supplierId: updateSupplierId || null,
          fulfilmentModel: updateFulfilmentModel,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedOrder(null);
        loadData();
      } else {
        alert(data.error || "Update failed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadInvoice = (order: any) => {
    const doc = generateInvoicePdf(order);
    doc.save(`${order.orderNumber}-Tax-Invoice.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Orders & Fulfilment Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dispatch, assign suppliers, and track milestone delivery status
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="SUPPLIER_PROCESSING">SUPPLIER_PROCESSING</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Order ID & Date</th>
              <th className="p-4">Customer & City</th>
              <th className="p-4">Amount / Mode</th>
              <th className="p-4">Status</th>
              <th className="p-4">Supplier & Fulfilment</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <span className="font-bold text-brand-blue">{ord.orderNumber}</span>
                  <span className="block text-[10px] text-slate-400">
                    {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-slate-900">{ord.customerName}</span>
                  <span className="block text-[10px] text-slate-500">
                    {ord.customerPhone} • PIN: {ord.pincode}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-extrabold text-slate-900">
                    ₹{ord.grandTotal.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {ord.paymentMethod} ({ord.paymentStatus})
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-brand-blue">
                    {ord.orderStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-slate-800">
                    {ord.supplier?.companyName || "Unassigned"}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {ord.fulfilmentModel}
                  </span>
                </td>
                <td className="p-4 text-right space-x-1.5">
                  <button
                    onClick={() => handleDownloadInvoice(ord)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 inline-block"
                    title="Download Tax Invoice"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-blue" />
                  </button>
                  <button
                    onClick={() => handleOpenManage(ord)}
                    className="px-3 py-1.5 bg-brand-blue hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    Manage Fulfilment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fulfilment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-dropdown border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Manage Order #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFulfilment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="SUPPLIER_PROCESSING">SUPPLIER_PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURNED">RETURNED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Sourcing Supplier</label>
                <select
                  value={updateSupplierId}
                  onChange={(e) => setUpdateSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.deliveryArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fulfilment Architecture Model</label>
                <select
                  value={updateFulfilmentModel}
                  onChange={(e) => setUpdateFulfilmentModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="LOCAL_SUPPLIER_LOCAL_DELIVERY">Local Supplier → Local Delivery → Customer</option>
                  <option value="SUPPLIER_TO_CUSTOMER">Direct Supplier → Customer (Drop-ship)</option>
                  <option value="SUPPLIER_WAREHOUSE_CUSTOMER">Supplier → Hub Warehouse → Customer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Airway Bill / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. AUR-EXP-99212"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Update Order Fulfilment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
