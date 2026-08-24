'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContext';

export interface WishlistItemType {
  id: string;
  productId: string;
  variantId: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    sellingPrice: number;
    mrp: number;
    images: string | null;
    rating: number;
    reviewCount: number;
    status: string;
    brand: { name: string } | null;
    category: { name: string } | null;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    price: number;
    mrp: number;
  } | null;
}

interface WishlistContextType {
  items: WishlistItemType[];
  isLoading: boolean;
  isInWishlist: (productId: string, variantId?: string | null) => boolean;
  toggleWishlist: (productId: string, variantId?: string | null) => Promise<boolean>;
  removeFromWishlist: (wishlistId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useToast();
  const [items, setItems] = useState<WishlistItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items || []);
      }
    } catch {
      // Ignore background error
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const isInWishlist = (productId: string, variantId: string | null = null): boolean => {
    return items.some(
      (item) => item.productId === productId && (variantId ? item.variantId === variantId : true)
    );
  };

  const toggleWishlist = async (
    productId: string,
    variantId: string | null = null
  ): Promise<boolean> => {
    const exists = isInWishlist(productId, variantId);
    try {
      if (exists) {
        const item = items.find(
          (i) => i.productId === productId && (variantId ? i.variantId === variantId : true)
        );
        if (item) {
          const res = await fetch(`/api/wishlist?wishlistId=${item.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            success('Removed from Wishlist');
            await fetchWishlist();
            return false;
          }
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId }),
        });
        const data = await res.json();
        if (data.success) {
          success('Added to Wishlist', 'Item saved to your private wishlist');
          await fetchWishlist();
          return true;
        } else {
          error(data.error || 'Failed to update wishlist');
        }
      }
    } catch {
      error('Network error updating wishlist');
    }
    return false;
  };

  const removeFromWishlist = async (wishlistId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/wishlist?wishlistId=${wishlistId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Item removed from wishlist');
        await fetchWishlist();
        return true;
      } else {
        error(data.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch {
      error('Network error');
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
