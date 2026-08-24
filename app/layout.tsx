import type { Metadata, Viewport } from 'next';
import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastContext';
import { CartProvider } from '@/components/customer/CartContext';
import { WishlistProvider } from '@/components/customer/WishlistContext';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts';
import { getOrganizationSchema, getWebSiteSchema } from '@/lib/seo/structured-data';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#04100c',
};

export const metadata: Metadata = {
  title: 'AUREEVO — The World of Luxury',
  description:
    'The premier luxury multi-category e-commerce platform. Formulated skincare, haute parfumerie, and rare artisanal beauty.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com'),
  icons: {
    icon: '/images/aureevo-logo.png',
    apple: '/images/aureevo-logo.png',
  },
  openGraph: {
    title: 'AUREEVO — The World of Luxury',
    description: 'Premier luxury formulations, bespoke beauty and haute fragrances.',
    url: 'https://aureevo.com',
    siteName: 'AUREEVO',
    images: [
      {
        url: '/images/aureevo-logo.png',
        width: 1200,
        height: 630,
        alt: 'AUREEVO — The World of Luxury',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = getOrganizationSchema();
  const siteSchema = getWebSiteSchema();

  return (
    <html lang="en" className={`${cinzel.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-luxury-darkest text-luxury-text antialiased selection:bg-luxury-gold selection:text-luxury-darkest">
        <AnalyticsScripts />
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
