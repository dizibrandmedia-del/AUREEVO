import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  goldBorder?: boolean;
}

export function Card({ className, goldBorder = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-luxury-card/90 border p-6 transition-all duration-200',
        goldBorder
          ? 'border-luxury-gold/30 shadow-lg shadow-luxury-gold/5'
          : 'border-luxury-border/80 shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-luxury-card to-luxury-dark/95 border border-luxury-border/90 p-5 shadow-lg relative overflow-hidden group hover:border-luxury-gold/40 transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-luxury-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold font-brand text-white mt-1.5 tracking-wide">{value}</h3>
          {subtitle && <p className="text-xs text-luxury-muted mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-luxury-gold shrink-0 group-hover:scale-105 group-hover:border-luxury-gold/50 transition-all duration-200">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={trendPositive ? 'text-emerald-400' : 'text-rose-400'}>{trend}</span>
          <span className="text-luxury-muted/70">vs prior period</span>
        </div>
      )}
    </div>
  );
}
