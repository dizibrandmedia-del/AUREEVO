import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole, RolePermissions } from "./rbac";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  installationType?: string;
  installationCost?: number;
  addInstallation?: boolean;
}

interface CartStore {
  items: CartItem[];
  appliedCoupon: { code: string; discount: number; discountType: string } | null;
  pincode: string;
  deliveryCharge: number;
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleInstallation: (productId: string) => void;
  applyCoupon: (code: string, discount: number, discountType: string) => void;
  removeCoupon: () => void;
  setPincode: (pincode: string, deliveryCharge?: number) => void;
  clearCart: () => void;
  
  // Computed values
  getMrpTotal: () => number;
  getSubtotal: () => number;
  getSavings: () => number;
  getCouponDiscount: () => number;
  getInstallationTotal: () => number;
  getGstAmount: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      pincode: "221001",
      deliveryCharge: 0,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          const primaryImage =
            product.images?.[0]?.url ||
            (typeof product.images?.[0] === "string" ? product.images[0] : "") ||
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800";

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                image: primaryImage,
                mrp: product.mrp,
                sellingPrice: product.sellingPrice,
                quantity,
                installationType: product.installationType,
                installationCost: product.installationCost || 0,
                addInstallation: product.installationType === "FREE",
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      toggleInstallation: (productId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, addInstallation: !i.addInstallation }
              : i
          ),
        }));
      },

      applyCoupon: (code, discount, discountType) => {
        set({ appliedCoupon: { code, discount, discountType } });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      setPincode: (pincode, deliveryCharge = 0) => {
        set({ pincode, deliveryCharge });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      getMrpTotal: () => {
        return get().items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.sellingPrice * item.quantity,
          0
        );
      },

      getSavings: () => {
        return get().getMrpTotal() - get().getSubtotal();
      },

      getCouponDiscount: () => {
        const { appliedCoupon } = get();
        if (!appliedCoupon) return 0;
        const subtotal = get().getSubtotal();
        if (appliedCoupon.discountType === "PERCENTAGE") {
          return Math.round((subtotal * appliedCoupon.discount) / 100);
        }
        return Math.min(appliedCoupon.discount, subtotal);
      },

      getInstallationTotal: () => {
        return get().items.reduce((sum, item) => {
          if (item.addInstallation && item.installationType === "PAID") {
            return sum + (item.installationCost || 0);
          }
          return sum;
        }, 0);
      },

      getGstAmount: () => {
        // Indian GST standard 18% included or calculated on taxable value
        const taxable = get().getSubtotal() - get().getCouponDiscount();
        return Math.round((taxable * 18) / 118);
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getCouponDiscount();
        const delivery = get().deliveryCharge;
        const installation = get().getInstallationTotal();
        return Math.max(0, subtotal - discount + delivery + installation);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "aurevo_cart",
    }
  )
);

// Wishlist Store
interface WishlistStore {
  items: any[];
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.some((i) => i.id === product.id);
          if (exists) {
            return { items: state.items.filter((i) => i.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });
      },
      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "aurevo_wishlist",
    }
  )
);

// Product Comparison Store (2 to 4 products)
interface CompareStore {
  items: any[];
  toggleCompare: (product: any) => boolean; // returns false if max 4 reached
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleCompare: (product) => {
        const { items } = get();
        const exists = items.some((i) => i.id === product.id);
        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) });
          return true;
        }
        if (items.length >= 4) {
          return false; // limit 4
        }
        set({ items: [...items, product] });
        return true;
      },
      isInCompare: (productId) => {
        return get().items.some((i) => i.id === productId);
      },
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: "aurevo_compare",
    }
  )
);
