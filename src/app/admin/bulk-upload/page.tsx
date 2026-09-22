"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  ArrowRight,
  Download,
} from "lucide-react";
import Papa from "papaparse";

export default function BulkUploadPage() {
  const [fileData, setFileData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const sampleCsvTemplate = `Product Name,Brand,Category,Model,SKU,Purchase Price,MRP,Selling Price,Stock,GST,Warranty,Description,Image URL
Sony 65-inch Bravia 4K Google TV,Sony,Electronics,KD-65X74L,SON-TV-65-01,58000,99900,74990,15,18,24,"4K Ultra HD Display with X1 4K Processor and Dolby Audio","https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"
Godrej 190L Direct Cool Single Door Refrigerator,Godrej,Refrigeration,RD-EDGED-190,GOD-REF-190-01,11200,18990,14490,20,18,120,"Advanced Inverter Compressor with Turbo Cooling","https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800"
Voltas 2 Ton 3 Star Inverter Split AC,Voltas,AC & Cooling,243V-Vectra,VOL-AC-2T-01,31000,64990,48990,10,28,60,"High Ambient Cooling with Anti-Microbial Filter","https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "AUREVO_Bulk_Product_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setFileData(results.data);
        runValidation(results.data);
      },
    });
  };

  const handleLoadSample = () => {
    Papa.parse(sampleCsvTemplate, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFileData(results.data);
        runValidation(results.data);
      },
    });
  };

  const runValidation = async (rows: any[]) => {
    setValidating(true);
    setValidationResult(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/v1/products/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VALIDATE",
          rows,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setValidationResult(data);
      } else {
        alert(data.error || "Validation failed.");
      }
    } catch (err) {
      alert("Validation network error.");
    } finally {
      setValidating(false);
    }
  };

  const handleCommitImport = async () => {
    if (!fileData || fileData.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/v1/products/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMMIT_CREATE",
          rows: fileData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data);
        setValidationResult(null);
        setFileData([]);
      } else {
        alert(data.error || "Import failed.");
      }
    } catch (err) {
      alert("Import network error.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Bulk Product Upload & Validation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            2-Step Process: Upload CSV/Excel → Validate Against Master Taxonomy → Commit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-brand-blue" />
            Download Sample CSV
          </button>
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-1.5 bg-brand-violet text-white rounded-xl text-xs font-bold hover:bg-purple-700"
          >
            Load Sample 3 Products
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 hover:border-brand-blue p-8 text-center space-y-3 transition">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-800">
            Select CSV or Excel Spreadsheet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Columns: Product Name, Brand, Category, Model, SKU, Purchase Price, MRP, Selling Price, Stock, GST, Warranty
          </p>
        </div>

        <div>
          <label className="inline-block px-5 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm">
            <span>Browse CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Validation Result Preview Report */}
      {validationResult && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-blue" />
                Upload Validation Summary
              </h3>
              <p className="text-slate-500 text-xs">
                Total Rows: {validationResult.summary.totalRows} • Valid:{" "}
                <strong className="text-emerald-600">{validationResult.summary.totalValid}</strong> • Errors:{" "}
                <strong className="text-red-500">{validationResult.summary.totalErrors}</strong>
              </p>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={importing || validationResult.summary.totalValid === 0}
              className="px-6 py-2.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              {importing ? "Importing to Catalog..." : `Commit ${validationResult.summary.totalValid} Products`}
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">MRP / Selling</th>
                  <th className="p-3">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validationResult.rows.map((r: any) => (
                  <tr key={r.rowNumber} className={r.isValid ? "hover:bg-slate-50" : "bg-red-50/50"}>
                    <td className="p-3 font-bold text-slate-400">{r.rowNumber}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {r.data["Product Name"] || r.data.name}
                    </td>
                    <td className="p-3">{r.data["Brand"] || r.data.brand}</td>
                    <td className="p-3">{r.data["Category"] || r.data.category}</td>
                    <td className="p-3 font-semibold">
                      ₹{r.data["Selling Price"] || r.data.sellingPrice}
                    </td>
                    <td className="p-3">
                      {r.isValid ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          VALID
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          {r.errors.map((err: string, i: number) => (
                            <span key={i} className="block text-[10px] text-red-600 font-semibold">
                              • {err}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success Import Result */}
      {importResult && (
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-emerald-900 text-base">Bulk Import Successful!</h3>
          <p className="text-xs text-emerald-700">
            {importResult.message} Newly imported items are now available in the product approval desk.
          </p>
        </div>
      )}
    </div>
  );
}
