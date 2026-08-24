'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContext';

export interface CartItemType {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  variantName: string | null;
  sku: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  maxStock: number;
  isSavedForLater: boolean;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  itemCount: number;
}

interface CartContextType {
  items: CartItemType[];
  savedItems: CartItemType[];
  summary: CartSummary;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  saveForLater: (cartItemId: string) => Promise<boolean>;
  moveToCart: (cartItemId: string) => Promise<boolean>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useToast();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [savedItems, setSavedItems] = useState<CartItemType[]>([]);
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    freeShippingThreshold: 5000,
    amountNeededForFreeShipping: 5000,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items || []);
        setSavedItems(data.data.savedItems || []);
        setSummary(data.data.summary);
      }
    } catch {
      // Background sync fail silent
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (
    productId: string,
    variantId: string | null = null,
    quantity: number = 1
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        success('Added to Bag', 'Item added to your luxury shopping bag');
        await fetchCart();
        setIsCartOpen(true);
        return true;
      } else {
        error(data.error || 'Failed to add item to bag');
        return false;
      }
    } catch {
      error('Network error updating bag');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        return true;
      } else {
        error(data.error || 'Stock limit reached');
        return false;
      }
    } catch {
      error('Failed to update quantity');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Item removed from shopping bag');
        await fetchCart();
        return true;
      } else {
        error(data.error || 'Failed to remove item');
        return false;
      }
    } catch {
      error('Network error');
      return false;
    }
  };

  const saveForLater = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/save-for-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, saveForLater: true }),
      });
      const data = await res.json();
      if (data.success) {
        success('Saved for Later');
        await fetchCart();
        return true;
      } else {
        error(data.error || 'Failed to save item');
        return false;
      }
    } catch {
      error('Network error');
      return false;
    }
  };

  const moveToCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/save-for-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, saveForLater: false }),
      });
      const data = await res.json();
      if (data.success) {
        success('Moved to Active Bag');
        await fetchCart();
        return true;
      } else {
        error(data.error || 'Failed to move item to bag');
        return false;
      }
    } catch {
      error('Network error');
      return false;
    }
  };

  const clearCart = () => {
    setItems([]);
    setSummary({
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      freeShippingThreshold: 5000,
      amountNeededForFreeShipping: 5000,
      itemCount: 0,
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        summary,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        saveForLater,
        moveToCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
