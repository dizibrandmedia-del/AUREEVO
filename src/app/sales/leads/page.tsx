"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  PhoneCall,
  MessageCircle,
  Clock,
  Plus,
  ArrowRight,
  FileText,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const PIPELINE_STAGES = [
  { key: "NEW", title: "New Leads", color: "border-blue-400 bg-blue-50/20" },
  { key: "CONTACTED", title: "Contacted", color: "border-cyan-400 bg-cyan-50/20" },
  { key: "INTERESTED", title: "Interested", color: "border-indigo-400 bg-indigo-50/20" },
  { key: "QUOTATION", title: "Quotation Sent", color: "border-purple-400 bg-purple-50/20" },
  { key: "NEGOTIATION", title: "Negotiation", color: "border-amber-400 bg-amber-50/20" },
  { key: "WON", title: "Won / Converted", color: "border-emerald-400 bg-emerald-50/20" },
  { key: "LOST", title: "Lost", color: "border-red-400 bg-red-50/20" },
];

export default function LeadPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activityNote, setActivityNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStageChange = async (leadId: string, targetStage: string) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: targetStage } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: targetStage });
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Sales CRM Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage Progression: New → Contacted → Interested → Quotation → Negotiation → Won
          </p>
        </div>

        <button
          onClick={loadLeads}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh Pipeline
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);

          return (
            <div
              key={stage.key}
              className={`w-72 shrink-0 rounded-3xl border-t-4 ${stage.color} bg-white p-4 shadow-sm space-y-3`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  {stage.title}
                </h3>
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards in this stage */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-brand-violet bg-white shadow-sm hover:shadow transition cursor-pointer space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-900">{lead.name}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-violet-100 text-brand-violet">
                        {lead.leadSource}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {lead.requirement || lead.productName || "General enquiry"}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{lead.city || "Direct Enquiry"}</span>
                      <span>{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>

                    {/* Quick Move Stage */}
                    <div className="pt-1 flex items-center gap-1">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStageChange(lead.id, e.target.value);
                        }}
                        className="w-full text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded p-1"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            Move to: {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Inspection Drawer/Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-dropdown border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-brand-violet uppercase">
                  Lead Details • {selectedLead.leadSource}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedLead.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Mobile</span>
                <strong className="text-slate-900">{selectedLead.phone}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Location</span>
                <strong className="text-slate-900">{selectedLead.city || "Not Specified"}</strong>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Requirement / Products</span>
                <p className="text-slate-800 font-medium mt-0.5">{selectedLead.requirement || selectedLead.productName}</p>
              </div>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                value={selectedLead.status}
                onChange={(e) => handleStageChange(selectedLead.id, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-brand-violet"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={`https://wa.me/91${selectedLead.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(
                  selectedLead.name
                )},%20I%20am%20calling%20from%20AUREVO.digital`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Customer
              </a>

              <Link
                href={`/sales/quotations?customerName=${encodeURIComponent(selectedLead.name)}&phone=${selectedLead.phone}`}
                className="flex-1 py-2.5 bg-brand-violet hover:bg-purple-700 text-white rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Generate Quotation
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
