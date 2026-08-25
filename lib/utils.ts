import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, length = 60): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function parseProductImages(images: any, fallback = '/images/aureevo-logo.png'): string[] {
  if (!images) return [fallback];
  if (Array.isArray(images)) return images.length > 0 ? images : [fallback];
  if (typeof images === 'string') {
    try {
      const trimmed = images.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (typeof parsed === 'string' && parsed.length > 0) return [parsed];
      }
      return trimmed.length > 0 ? [trimmed] : [fallback];
    } catch {
      return images.length > 0 ? [images] : [fallback];
    }
  }
  return [fallback];
}
