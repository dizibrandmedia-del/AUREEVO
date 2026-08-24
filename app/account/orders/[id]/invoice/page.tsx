'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CustomerInvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.invoice) {
          setInvoice(data.data.invoice);
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return <div className="p-10 text-center text-luxury-muted font-mono">Generating Official Tax Invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-10 text-center text-rose-400">Invoice not found or unauthorized.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-4 sm:p-10 print:p-0 print:bg-white print:text-black">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link href={`/account/orders/${params.id}`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Order Details
          </Button>
        </Link>
        <Button variant="gold" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
          Print Tax Invoice
        </Button>
      </div>

      {/* Invoice Document Box */}
      <div className="max-w-4xl mx-auto bg-luxury-darkest border border-luxury-border/80 rounded-3xl p-8 sm:p-12 shadow-2xl print:shadow-none print:border-none print:p-6 print:bg-white print:text-black space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-luxury-border/60 pb-6 print:border-neutral-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden print:border-neutral-400">
              <img src="/images/aureevo-logo.png" alt="AUREEVO" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-brand tracking-widest text-white print:text-black">
                AUREEVO
              </h1>
              <p className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold-light print:text-neutral-600 font-bold">
                THE WORLD OF LUXURY
              </p>
              <p className="text-[11px] text-luxury-muted print:text-neutral-600 mt-1">
                AUREEVO Luxury Retail Private Limited • GSTIN: 27AABCA1234F1Z8
              </p>
            </div>
          </div>

          <div className="text-right space-y-1 text-xs">
            <span className="px-3 py-1 rounded-full bg-luxury-gold/20 text-luxury-gold-light border border-luxury-gold/40 text-xs font-bold uppercase tracking-wider print:border-neutral-400 print:text-black inline-block">
              Tax Invoice
            </span>
            <p className="font-mono font-bold text-white print:text-black pt-1">
              Invoice #{invoice.invoiceNumber}
            </p>
            <p className="text-luxury-muted print:text-neutral-600">Order: {invoice.orderNumber}</p>
            <p className="text-luxury-muted print:text-neutral-600">Date: {invoice.orderDate}</p>
          </div>
        </div>

        {/* Addresses 2-Col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-luxury-surface/30 border border-luxury-border print:border-neutral-300 print:bg-neutral-50">
            <span className="font-bold text-luxury-gold-light uppercase font-mono tracking-wider block">
              Billed & Dispatched To:
            </span>
            <p className="font-bold text-white print:text-black text-sm">{invoice.customerName}</p>
            <p className="text-luxury-muted print:text-neutral-700">{invoice.shippingAddress.addressLine1}</p>
            {invoice.shippingAddress.addressLine2 && (
              <p className="text-luxury-muted print:text-neutral-700">{invoice.shippingAddress.addressLine2}</p>
            )}
            <p className="text-luxury-muted print:text-neutral-700">
              {invoice.shippingAddress.city}, {invoice.shippingAddress.state} - {invoice.shippingAddress.pincode}
            </p>
            <p className="text-luxury-muted print:text-neutral-700 font-mono">
              Phone: {invoice.customerPhone || invoice.shippingAddress.phone}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-luxury-surface/30 border border-luxury-border print:border-neutral-300 print:bg-neutral-50">
            <span className="font-bold text-luxury-gold-light uppercase font-mono tracking-wider block">
              Registered Fulfillment Vault:
            </span>
            <p className="font-bold text-white print:text-black">AUREEVO Central Master Vault #1</p>
            <p className="text-luxury-muted print:text-neutral-700">The Oberoi Grand Arcade, Nariman Point</p>
            <p className="text-luxury-muted print:text-neutral-700">Mumbai, Maharashtra - 400021, India</p>
            <p className="text-luxury-muted print:text-neutral-700 font-mono">Place of Supply: Maharashtra (27)</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-luxury-border/60 print:border-neutral-300 text-luxury-muted print:text-neutral-600 font-mono uppercase">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Formulation & Edition</th>
                <th className="py-3 px-2">HSN/SAC</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-right">GST Rate</th>
                <th className="py-3 px-2 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/40 print:divide-neutral-200">
              {invoice.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 px-2 font-mono text-luxury-muted">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <span className="font-bold text-white print:text-black block">{item.name}</span>
                    {item.variantName && (
                      <span className="text-[10px] text-luxury-gold font-mono">{item.variantName}</span>
                    )}
                  </td>
                  <td className="py-3 px-2 font-mono text-luxury-muted">{item.hsnCode}</td>
                  <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 px-2 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-2 text-right font-mono">{item.taxRate}%</td>
                  <td className="py-3 px-2 text-right font-bold font-mono text-white print:text-black">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-luxury-border/60 print:border-neutral-300 pt-6">
          <div className="text-xs space-y-2 text-luxury-muted print:text-neutral-700">
            <p>
              <strong className="text-white print:text-black">Payment Method:</strong> {invoice.paymentMethod}
            </p>
            <p>
              <strong className="text-white print:text-black">Transaction Ref:</strong> {invoice.transactionId}
            </p>
            <p className="text-[10px] pt-4 italic">
              This is a computer-generated luxury tax invoice authenticated via AUREEVO cryptographic ledger.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-luxury-muted print:text-neutral-700">
              <span>Item Subtotal:</span>
              <span className="font-mono text-white print:text-black font-semibold">
                ₹{invoice.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {invoice.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Voucher Discount ({invoice.couponCode}):</span>
                <span className="font-mono">-₹{invoice.couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-luxury-muted print:text-neutral-700">
              <span>CGST (9.0%):</span>
              <span className="font-mono">₹{invoice.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-luxury-muted print:text-neutral-700">
              <span>SGST (9.0%):</span>
              <span className="font-mono">₹{invoice.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-luxury-muted print:text-neutral-700">
              <span>White-Glove Shipping:</span>
              <span className="font-mono">
                {invoice.shippingFee === 0 ? 'COMPLIMENTARY' : `₹${invoice.shippingFee}`}
              </span>
            </div>
            <div className="pt-3 border-t border-luxury-border/60 print:border-neutral-300 flex justify-between text-base font-bold font-brand text-white print:text-black">
              <span>Grand Total:</span>
              <span className="text-luxury-gold print:text-black">
                ₹{invoice.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
