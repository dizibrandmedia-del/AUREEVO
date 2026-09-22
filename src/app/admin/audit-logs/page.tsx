import React from "react";
import { db } from "@/lib/db";
import { ShieldCheck, Clock, User, FileText } from "lucide-react";

export const revalidate = 0;

export default async function AuditLogsPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Security & Admin Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable log of administrative actions, pricing rule overrides, logins, and status transitions
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Entity ID</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-slate-500 text-[11px]">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {log.userName || "System"}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-brand-blue">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 font-semibold text-slate-700">{log.entity}</td>
                <td className="p-4 font-mono text-[11px] text-slate-400">
                  {log.entityId || "-"}
                </td>
                <td className="p-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                  {log.details || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
