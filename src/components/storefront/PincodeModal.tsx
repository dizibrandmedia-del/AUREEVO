"use client";

import React, { useState } from "react";
import { X, MapPin, CheckCircle2, AlertCircle, Truck, Wrench } from "lucide-react";
import { useCartStore } from "@/lib/store";

interface PincodeModalProps {
  onClose: () => void;
}

export default function PincodeModal({ onClose }: PincodeModalProps) {
  const currentPin = useCartStore((s) => s.pincode);
  const setStorePincode = useCartStore((s) => s.setPincode);

  const [inputPincode, setInputPincode] = useState(currentPin || "");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPincode || inputPincode.length !== 6) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setChecking(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/shipping/pincode?pincode=${inputPincode}`);
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStorePincode(inputPincode, data.deliveryCharge || 0);
      } else {
        setError(data.error || "Pincode service check failed.");
      }
    } catch (err) {
      setError("Network error checking pincode.");
    } finally {
      setChecking(false);
    }
  };

  const handleQuickPin = (pin: string) => {
    setInputPincode(pin);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-dropdown border border-slate-100 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Select Delivery Location</h3>
            <p className="text-xs text-slate-500">Check speed & installation availability</p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="mt-4">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit PIN code (e.g. 221001)"
              className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <button
              type="submit"
              disabled={checking}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-blue text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {checking ? "Checking..." : "Apply"}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}

        {/* Result Breakdown */}
        {result && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Delivery Available in {result.city}, {result.state}
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1 border-t border-emerald-200/60">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-blue" />
                <span>
                  Delivery:{" "}
                  <strong>{result.deliveryCharge === 0 ? "FREE" : `₹${result.deliveryCharge}`}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand-violet" />
                <span>
                  Install:{" "}
                  <strong className="text-emerald-700">Available</strong>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700">
              Estimated delivery: <strong>{result.estimatedDays} business days</strong> with live tracking.
            </p>

            <button
              onClick={onClose}
              className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
            >
              Confirm Location
            </button>
          </div>
        )}

        {/* Popular Cities Quick Select */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Popular Hubs
          </p>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { name: "Varanasi (221001)", pin: "221001" },
              { name: "New Delhi (110001)", pin: "110001" },
              { name: "Lucknow (226001)", pin: "226001" },
              { name: "Mumbai (400001)", pin: "400001" },
            ].map((hub) => (
              <button
                key={hub.pin}
                type="button"
                onClick={() => handleQuickPin(hub.pin)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-brand-blue text-slate-700 text-[11px] transition font-medium"
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
