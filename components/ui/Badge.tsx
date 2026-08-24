import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'emerald' | 'rose' | 'amber' | 'neutral' | 'blue' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'sm', children, ...props }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    gold: 'bg-luxury-gold/15 text-luxury-gold-light border border-luxury-gold/40',
    emerald: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50',
    rose: 'bg-rose-950/80 text-rose-300 border border-rose-700/50',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-700/50',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-700/50',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-700/50',
    neutral: 'bg-luxury-surface/70 text-luxury-muted border border-luxury-border',
    blue: 'bg-sky-950/80 text-sky-300 border border-sky-700/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full tracking-wide capitalize',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
