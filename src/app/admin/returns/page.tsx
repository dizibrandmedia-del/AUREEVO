"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      let url = "/api/v1/returns?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      if (typeFilter !== "ALL") url += `type=${typeFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReturns(data.returns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter, typeFilter]);

  const handleOpenManage = (reqItem: any) => {
    setSelectedRequest(reqItem);
    setEditStatus(reqItem.status);
    setAdminNotes(reqItem.adminNotes || "");
    setUpdateSuccess(false);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/v1/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: editStatus,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUpdateSuccess(true);
        // Refresh local items
        setReturns((prev) =>
          prev.map((item) =>
            item.id === selectedRequest.id
              ? { ...item, status: editStatus, adminNotes }
              : item
          )
        );
        setTimeout(() => {
          setSelectedRequest(null);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter items by search query
  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase();
    const orderNo = r.order?.orderNumber?.toLowerCase() || "";
    const custName = (r.customer?.name || r.order?.customerName || "").toLowerCase();
    const reason = (r.reason || "").toLowerCase();
    return orderNo.includes(q) || custName.includes(q) || reason.includes(q);
  });

  const totalCount = returns.length;
  const pendingCount = returns.filter((r) => ["REQUESTED", "UNDER_REVIEW"].includes(r.status)).length;
  const pickupCount = returns.filter((r) => ["APPROVED", "PICKUP_SCHEDULED"].includes(r.status)).length;
  const resolvedCount = returns.filter((r) => r.status === "RESOLVED").length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "RETURN":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "REPLACEMENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "WARRANTY":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "UNDER_REVIEW":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PICKUP_SCHEDULED":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-brand-blue" />
            Returns, Replacements & Warranty Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer return authorizations (RMA), defect verifications, warranty claims, and reverse logistics pickups.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims</p>
            <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reverse Pickup</p>
            <p className="text-2xl font-bold text-brand-blue">{pickupCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer, or Issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          >
            <option value="ALL">All Types</option>
            <option value="RETURN">Returns</option>
            <option value="REPLACEMENT">Replacements</option>
            <option value="WARRANTY">Warranty Claims</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RotateCcw className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading claims and return authorizations...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No Return or Warranty Claims Found</p>
            <p className="text-xs text-slate-400 mt-1">
              All reverse orders and customer warranty claims are currently in a healthy state.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Claim ID & Type</th>
                  <th className="py-3.5 px-4">Order Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Reason & Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-800 text-[11px]">
                        #{item.id.slice(0, 8).toUpperCase()}
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase ${getTypeBadge(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.order?.orderNumber || "N/A"}</div>
                      <div className="text-[11px] text-slate-500">
                        ₹{(item.order?.grandTotal || 0).toLocaleString("en-IN")}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">
                        {item.customer?.name || item.order?.customerName || "Customer"}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {item.customer?.phone || item.order?.customerPhone || "N/A"}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {item.order?.shippingAddressText || ""} {item.order?.pincode ? `(${item.order?.pincode})` : ""}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{item.reason}</div>
                      {item.description && (
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{item.description}</p>
                      )}
                      {item.adminNotes && (
                        <div className="mt-1 text-[10px] text-brand-blue bg-blue-50/60 p-1 rounded font-medium border border-blue-100">
                          Admin: {item.adminNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenManage(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        Manage <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage / Action Drawer Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-blue/30 text-cyan-300 border border-brand-blue/50">
                    {selectedRequest.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    #{selectedRequest.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Review & Update Request</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveStatus} className="p-6 space-y-5 text-xs">
              {/* Order & Customer Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Order Number</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedRequest.order?.orderNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Order Value</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    ₹{(selectedRequest.order?.grandTotal || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedRequest.customer?.name || selectedRequest.order?.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedRequest.customer?.phone || selectedRequest.order?.customerPhone}</span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {selectedRequest.order?.shippingAddressText || ""} - {selectedRequest.order?.pincode}
                  </span>
                </div>
              </div>

              {/* Reason Details */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-900 uppercase">Customer Reason</span>
                <p className="font-bold text-amber-950 text-sm mt-0.5">{selectedRequest.reason}</p>
                {selectedRequest.description && (
                  <p className="text-amber-900 text-xs mt-1.5 leading-relaxed">{selectedRequest.description}</p>
                )}
              </div>

              {/* Action: Status Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase text-[11px] tracking-wider">
                  Update Resolution Stage
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="REQUESTED">REQUESTED — Waiting for executive verification</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW — Defect verification / diagnostic call initiated</option>
                  <option value="APPROVED">APPROVED — Authorized for reverse pickup or service</option>
                  <option value="PICKUP_SCHEDULED">PICKUP_SCHEDULED — Courier / Local pickup assigned</option>
                  <option value="RESOLVED">RESOLVED — Replaced / Refunded / Repaired successfully</option>
                  <option value="REJECTED">REJECTED — Declined per policy / warranty void</option>
                </select>
              </div>

              {/* Action: Admin Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase text-[11px] tracking-wider">
                  Admin Internal Notes & Resolution Log
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="E.g., Verified serial number defect. Authorized reverse pickup via BlueDart AWB #98234."
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {updateSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status updated successfully!
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
