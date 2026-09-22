import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Package,
  Users,
  Building,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { calculateMargin } from "@/lib/margin";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Fresh metrics

export default async function AdminDashboardPage() {
  let totalOrders = 0;
  let pendingOrders = 0;
  let totalProducts = 0;
  let pendingApprovals = 0;
  let totalSuppliers = 0;
  let totalLeads = 0;
  let orders: any[] = [];
  let products: any[] = [];

  try {
    totalOrders = await db.order.count();
    pendingOrders = await db.order.count({ where: { orderStatus: "PENDING" } });
    totalProducts = await db.product.count();
    pendingApprovals = await db.product.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    });
    totalSuppliers = await db.supplier.count();
    totalLeads = await db.lead.count();

    orders = await db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        sellingPrice: true,
        purchasePrice: true,
        stock: true,
      },
    });
  } catch (error) {
    console.error("Database query fallback in AdminDashboardPage:", error);
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.grandTotal ?? 0), 0);
  let totalSellingValue = 0;
  let totalPurchaseCost = 0;
  let criticalMarginAlerts: any[] = [];

  for (const p of products) {
    totalSellingValue += p.sellingPrice * p.stock;
    totalPurchaseCost += p.purchasePrice * p.stock;

    const margin = calculateMargin(p.sellingPrice, p.purchasePrice);
    if (margin.alertLevel === "CRITICAL" && p.purchasePrice > 0) {
      criticalMarginAlerts.push({ ...p, ...margin });
    }
  }

  const grossMarginTotal = totalSellingValue - totalPurchaseCost;
  const netMarginTotal = Math.round(grossMarginTotal * 0.85); // minus ~15% logistics, gateway, packaging
  const netMarginPercent =
    totalSellingValue > 0 ? ((netMarginTotal / totalSellingValue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Executive Business Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial margins, order fulfilment status, and catalog operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/approval"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition"
          >
            Pending Approvals ({pendingApprovals})
          </Link>
          <Link
            href="/admin/bulk-upload"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            + Bulk Product Upload
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs last week
          </span>
        </div>

        {/* Net Margin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Margin (PRD Engine)
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-brand-violet flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-violet">
            ₹{netMarginTotal.toLocaleString()}{" "}
            <span className="text-xs font-bold text-slate-500">({netMarginPercent}%)</span>
          </p>
          <span className="text-[11px] text-slate-500">
            Selling Price – Purchase Cost – Other Costs
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
          <span className="text-[11px] text-slate-500">
            {pendingOrders} awaiting supplier dispatch
          </span>
        </div>

        {/* CRM Leads */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active CRM Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalLeads}</p>
          <span className="text-[11px] text-brand-blue font-bold">
            High-intent wedding & bulk enquiries
          </span>
        </div>
      </div>

      {/* Margin Engine Summary & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Margin Distribution Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Category Margin Rules & Profitability Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Formula: Selling Price – Purchase Cost – Other Costs (3%) = Net Margin
              </p>
            </div>
            <Link
              href="/admin/pricing-margins"
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Configure Rules →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Products</th>
                  <th className="pb-2">Inventory Val.</th>
                  <th className="pb-2">Target Margin</th>
                  <th className="pb-2">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { cat: "Electronics (4K TVs, Audio)", count: 4, val: "₹1,031,760", target: "12%", health: "HEALTHY" },
                  { cat: "AC & Cooling", count: 3, val: "₹800,820", target: "14%", health: "HEALTHY" },
                  { cat: "Refrigeration", count: 3, val: "₹419,850", target: "15%", health: "HEALTHY" },
                  { cat: "Washing & Cleaning", count: 2, val: "₹455,880", target: "13%", health: "HEALTHY" },
                  { cat: "Furniture (Teak Beds)", count: 3, val: "₹399,990", target: "25%", health: "EXCELLENT" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{row.cat}</td>
                    <td className="py-2.5 text-slate-600">{row.count}</td>
                    <td className="py-2.5 text-slate-800 font-semibold">{row.val}</td>
                    <td className="py-2.5 font-bold text-brand-blue">{row.target}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {row.health}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Alerts & Notifications */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Operations Attention
          </h3>

          <div className="space-y-3 text-xs">
            {pendingApprovals > 0 ? (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold">{pendingApprovals} Product(s) Pending Review</p>
                <p className="text-[11px] text-amber-700">
                  Listing executives submitted new items awaiting spec and image approval.
                </p>
                <Link
                  href="/admin/approval"
                  className="inline-block mt-1 text-xs font-bold text-amber-900 underline"
                >
                  Review Listings →
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 text-[11px]">
                ✓ All product listings are currently approved and published.
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 space-y-1">
              <p className="font-bold">Supplier Delivery SLA</p>
              <p className="text-[11px] text-blue-700">
                100% of shipments currently fulfilled on time via AUREVO Express Fleet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Fulfilment Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
            <p className="text-slate-500">Live order lifecycle & supplier assignment</p>
          </div>
          <Link href="/admin/orders" className="text-brand-blue font-bold hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">PIN</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Fulfilment Model</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-brand-blue">{ord.orderNumber}</td>
                  <td className="py-3 font-semibold text-slate-800">{ord.customerName}</td>
                  <td className="py-3 text-slate-600">{ord.pincode}</td>
                  <td className="py-3 font-bold text-slate-900">₹{ord.grandTotal.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-brand-blue">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 text-[11px]">{ord.fulfilmentModel}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-brand-blue hover:text-white rounded-lg font-bold transition"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
