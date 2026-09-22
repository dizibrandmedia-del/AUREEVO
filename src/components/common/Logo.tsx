"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "full" | "compact" | "icon" | "badge";
  size?: "sm" | "md" | "lg" | "xl";
  badgeText?: string;
  className?: string;
  href?: string;
  priority?: boolean;
}

export default function Logo({
  variant = "full",
  size,
  badgeText,
  className = "",
  href = "/",
  priority = false,
}: LogoProps) {
  const resolvedSize = size || (variant === "compact" || variant === "icon" ? "sm" : "md");

  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl",
    md: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl",
    lg: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl",
    xl: "w-24 h-24 rounded-3xl",
  }[resolvedSize] || "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official AUREVO Logo Image */}
      <div className={`relative ${sizeClasses} overflow-hidden shadow-md ring-1 ring-brand-gold/40 hover:ring-brand-gold transition-all duration-200 bg-brand-dark shrink-0`}>
        <Image
          src="/logo.png"
          alt="AUREVO - The World of Luxury"
          fill
          sizes="(max-width: 768px) 56px, 80px"
          className="object-cover"
          priority={priority}
        />
      </div>

      {badgeText && (
        <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold-light border border-brand-gold/40 uppercase font-mono">
          {badgeText}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform hover:opacity-95 active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
}

