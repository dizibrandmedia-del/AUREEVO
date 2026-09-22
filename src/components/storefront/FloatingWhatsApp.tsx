"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "919839057744"; // AUREEVO Verified Support Helpline

  const handleWhatsApp = (text?: string) => {
    const defaultMsg = "Hi, I am shopping on AUREEVO. Please share the best price, EMI options, and delivery timeline.";
    const encoded = encodeURIComponent(text || defaultMsg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 font-sans">
      {/* Expanded Quick Help Popup */}
      {isOpen && (
        <div className="w-72 bg-white rounded-3xl shadow-2xl border border-brand-border/80 p-4 mb-2 animate-fadeIn text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">VIP Concierge Helpline</h4>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • Instant Reply
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 my-3 leading-relaxed">
            Need help choosing a TV, AC, Fridge, or Wedding Package? Chat directly with our electronics specialist!
          </p>

          <div className="space-y-1.5">
            <button
              onClick={() => handleWhatsApp("Hi, I want the best festival discount on OLED/Smart TVs.")}
              className="w-full text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-100 transition font-medium"
            >
              📺 Best Price on Smart TVs
            </button>
            <button
              onClick={() => handleWhatsApp("Hi, I want a quote for 1.5 Ton Inverter AC with free installation.")}
              className="w-full text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-100 transition font-medium"
            >
              ❄️ Inverter AC Installation Deals
            </button>
            <button
              onClick={() => handleWhatsApp("Hi, I am interested in the Wedding Luxury Appliance Package.")}
              className="w-full text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-100 transition font-medium"
            >
              🎁 Wedding Package Quotation
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => handleWhatsApp()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <a
              href={`tel:+${phoneNumber}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Store
            </a>
          </div>
        </div>
      )}

      {/* Main Floating WhatsApp Button with Pulse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="WhatsApp Support"
      >
        {/* Pulsating Ripple Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        <MessageCircle className="w-6 h-6 text-white" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Need Help? Chat with us
        </span>
      </button>
    </div>
  );
}
