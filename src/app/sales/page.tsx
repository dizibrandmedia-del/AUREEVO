import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Award,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";

export const revalidate = 0;

export default async function SalesDashboardPage() {
  const totalLeads = await db.lead.count();
  const newLeads = await db.lead.count({ where: { status: "NEW" } });
  const wonLeads = await db.lead.count({ where: { status: "WON" } });
  const lostLeads = await db.lead.count({ where: { status: "LOST" } });
  const inQuotation = await db.lead.count({ where: { status: "QUOTATION" } });

  const quotations = await db.quotation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalQuotedAmount = quotations.reduce((s, q) => s + q.totalAmount, 0);

  // Sales targets & conversion calculation
  const monthlyTarget = 1500000; // ₹15 Lakhs
  const achievedSales = wonLeads * 190000; // estimated average won deal value
  const commissionRate = 2.5; // 2.5% incentive
  const estimatedCommission = Math.round((achievedSales * commissionRate) / 100);
  const conversionRate =
    totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

  const recentLeads = await db.lead.findMany({
    include: {
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Sales & Commercial Desk Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Wedding packages, B2B institutional quotations, and customer follow-up metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sales/leads"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-violet hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Users className="w-4 h-4" /> Open Kanban Pipeline
          </Link>
          <Link
            href="/sales/quotations"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            <FileText className="w-4 h-4" /> Create Quotation
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Inbound Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-brand-violet flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalLeads}</p>
          <span className="text-[11px] text-brand-violet font-bold">
            {newLeads} pending initial contact
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quotations Active
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">{inQuotation}</p>
          <span className="text-[11px] text-slate-500">
            Total Quoted: ₹{totalQuotedAmount.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Deals Won (Conversion)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{wonLeads}</p>
          <span className="text-[11px] text-emerald-600 font-bold">
            {conversionRate}% Pipeline Conversion Rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Projected Incentive
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            ₹{estimatedCommission.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">
            2.5% incentive on won orders
          </span>
        </div>
      </div>

      {/* Pipeline Stage Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900">Lead Pipeline Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { stage: "NEW", count: newLeads, color: "bg-blue-500" },
            { stage: "CONTACTED", count: 1, color: "bg-cyan-500" },
            { stage: "INTERESTED", count: 1, color: "bg-indigo-500" },
            { stage: "QUOTATION", count: inQuotation, color: "bg-purple-500" },
            { stage: "NEGOTIATION", count: 0, color: "bg-amber-500" },
            { stage: "WON", count: wonLeads, color: "bg-emerald-500" },
            { stage: "LOST", count: lostLeads, color: "bg-red-500" },
          ].map((col) => (
            <div key={col.stage} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{col.stage}</span>
              <p className="text-xl font-black text-slate-900 mt-1">{col.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Customer Inquiries & Leads</h3>
            <p className="text-slate-500">Real-time incoming enquiries from storefront & wedding builder</p>
          </div>
          <Link href="/sales/leads" className="text-brand-violet font-bold hover:underline">
            Manage Leads in Kanban →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{lead.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-brand-violet">
                    {lead.leadSource}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {lead.status}
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5">
                  Mobile: <strong>{lead.phone}</strong> • City: {lead.city || "Not Specified"} • Requirement:{" "}
                  <span className="text-slate-700 font-medium">{lead.productName || lead.requirement}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/91${lead.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(
                    lead.name
                  )},%20I%20am%20calling%20from%20AUREVO.digital%20regarding%20your%20enquiry`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition"
                >
                  WhatsApp
                </a>
                <Link
                  href="/sales/leads"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
                >
                  View Lead
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
