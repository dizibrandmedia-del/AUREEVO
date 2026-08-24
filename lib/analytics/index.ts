export interface AnalyticsItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  variant?: string;
  price: number;
  quantity: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const Analytics = {
  pageView(url: string) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: url });
    }

    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  },

  viewItem(item: AnalyticsItem) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'INR',
        value: item.price,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            item_brand: item.brand || 'AUREEVO',
            item_category: item.category || 'Luxury Formulations',
            item_variant: item.variant,
            price: item.price,
            quantity: item.quantity || 1,
          },
        ],
      });
    }

    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [item.id],
        content_name: item.name,
        content_type: 'product',
        currency: 'INR',
        value: item.price,
      });
    }
  },

  addToCart(item: AnalyticsItem) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: item.price * (item.quantity || 1),
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            item_brand: item.brand || 'AUREEVO',
            price: item.price,
            quantity: item.quantity || 1,
          },
        ],
      });
    }

    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [item.id],
        content_name: item.name,
        content_type: 'product',
        currency: 'INR',
        value: item.price * (item.quantity || 1),
      });
    }
  },

  beginCheckout(items: AnalyticsItem[], totalAmount: number) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: totalAmount,
        items: items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });
    }

    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map((i) => i.id),
        num_items: items.reduce((acc, i) => acc + i.quantity, 0),
        currency: 'INR',
        value: totalAmount,
      });
    }
  },

  purchase(order: {
    orderNumber: string;
    grandTotal: number;
    taxTotal: number;
    shippingFee: number;
    items: AnalyticsItem[];
  }) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.orderNumber,
        value: order.grandTotal,
        tax: order.taxTotal,
        shipping: order.shippingFee,
        currency: 'INR',
        items: order.items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });
    }

    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: order.items.map((i) => i.id),
        content_type: 'product',
        currency: 'INR',
        value: order.grandTotal,
        num_items: order.items.reduce((acc, i) => acc + i.quantity, 0),
      });
    }
  },

  search(query: string) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', 'search', { search_term: query });
    }

    if (window.fbq) {
      window.fbq('track', 'Search', { search_string: query });
    }
  },
};
