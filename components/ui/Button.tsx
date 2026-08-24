'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'emerald' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 font-semibold',
    };

    const variantClasses = {
      gold: 'bg-gradient-to-r from-[#f3e5ab] via-[#d4af37] to-[#aa820a] text-luxury-darkest font-semibold hover:brightness-110 shadow-lg shadow-luxury-gold/15 active:scale-[0.98] border border-luxury-gold-light/40',
      emerald: 'bg-luxury-surface hover:bg-luxury-rich text-luxury-text border border-luxury-border shadow-md active:scale-[0.98]',
      outline: 'bg-transparent border border-luxury-gold/50 text-luxury-gold-light hover:bg-luxury-gold/10 active:scale-[0.98]',
      ghost: 'bg-transparent text-luxury-muted hover:text-luxury-text hover:bg-luxury-emerald/40',
      danger: 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60 active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
