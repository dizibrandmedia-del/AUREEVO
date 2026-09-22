import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AUREVO.digital | Smart Shopping. Better Living.",
  description:
    "India's premier digital electronics, home appliances, furniture and wedding package marketplace. Sourced smart, priced better, delivered with care.",
  keywords: [
    "AUREVO.digital",
    "electronics",
    "smart tv",
    "refrigerator",
    "air conditioner",
    "washing machine",
    "furniture",
    "wedding packages",
    "home appliances",
  ],
  openGraph: {
    title: "AUREVO.digital | Smart Shopping. Better Living.",
    description:
      "Explore top brands in 4K TVs, Inverter ACs, Frost-Free Refrigerators, Teakwood Beds, and Complete Wedding Packages.",
    url: "https://aurevo.digital",
    siteName: "AUREVO.digital",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
        {children}
      </body>
    </html>
  );
}
