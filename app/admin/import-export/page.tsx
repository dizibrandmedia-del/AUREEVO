'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  Layers,
  Sparkles,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/ToastContext';

export default function ImportExportPage() {
  const { success, error } = useToast();
  const [importType, setImportType] = useState<'products' | 'categories' | 'brands'>('products');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleExport = (type: string) => {
    window.open(`/api/admin/import-export/export?type=${type}`, '_blank');
    success(`Downloading ${type} CSV export...`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', importType);

    try {
      const res = await fetch('/api/admin/import-export/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data.data);
        success('Import completed', data.data.message);
      } else {
        error(data.error || 'Import failed');
      }
    } catch {
      error('Import processing error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Catalogue Import & Export Hub
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Bulk CSV data interchange with validation for products, categories, brands, and stock records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EXPORT SECTION */}
        <Card className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-luxury-border">
            <div className="w-10 h-10 rounded-xl bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-luxury-gold shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-brand text-white">Export Dataset</h3>
              <p className="text-xs text-luxury-muted">Generate instant CSV snapshots of live database entities.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                type: 'products',
                name: 'Product Catalogue Export',
                desc: 'All products, SKUs, pricing, formulations, and status.',
                icon: <Package className="w-4 h-4 text-luxury-gold" />,
              },
              {
                type: 'inventory',
                name: 'Live Stock Levels Export',
                desc: 'Current stock, reserved quantities, and warehouse codes.',
                icon: <Boxes className="w-4 h-4 text-luxury-gold" />,
              },
              {
                type: 'categories',
                name: 'Category Hierarchy Export',
                desc: 'Parent-child categories, slugs, and sort orders.',
                icon: <Layers className="w-4 h-4 text-luxury-gold" />,
              },
              {
                type: 'brands',
                name: 'Brand Portfolio Export',
                desc: 'Registered partner brands, websites, and metadata.',
                icon: <Sparkles className="w-4 h-4 text-luxury-gold" />,
              },
            ].map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-4 rounded-xl bg-luxury-surface/30 border border-luxury-border hover:border-luxury-gold/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-luxury-darkest border border-luxury-border">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{item.name}</h4>
                    <p className="text-[11px] text-luxury-muted">{item.desc}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(item.type)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export CSV
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* IMPORT SECTION */}
        <Card className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-luxury-border">
            <div className="w-10 h-10 rounded-xl bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-luxury-gold shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-brand text-white">Bulk CSV Import</h3>
              <p className="text-xs text-luxury-muted">Batch insert verified items directly into the catalogue.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
                Select Target Entity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['products', 'categories', 'brands'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setImportType(t);
                      setImportResult(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      importType === t
                        ? 'bg-luxury-gold text-luxury-darkest border-luxury-gold'
                        : 'bg-luxury-surface/30 border-luxury-border text-luxury-muted hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-luxury-gold/40 hover:border-luxury-gold rounded-2xl cursor-pointer bg-luxury-emerald/20 transition-all">
              <FileSpreadsheet className="w-10 h-10 text-luxury-gold mb-2" />
              <span className="text-sm font-semibold text-white">
                {isImporting ? 'Processing & Validating CSV...' : `Upload ${importType.toUpperCase()} CSV`}
              </span>
              <span className="text-xs text-luxury-muted mt-1">
                Must include headers (e.g. Name, SKU, SellingPrice for products)
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv,text/csv"
                className="hidden"
                disabled={isImporting}
              />
            </label>

            {/* Import Feedback Report */}
            {importResult && (
              <div className="p-4 rounded-xl bg-luxury-dark/95 border border-luxury-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Import Outcome:</span>
                  <Badge variant={importResult.errors?.length > 0 ? 'amber' : 'emerald'}>
                    {importResult.successCount} Imported Successfully
                  </Badge>
                </div>

                {importResult.errors?.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pr-1">
                    <p className="text-rose-400 font-semibold">Errors Encountered ({importResult.errors.length}):</p>
                    {importResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-1.5 rounded bg-rose-950/40 text-[11px] text-rose-300">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
