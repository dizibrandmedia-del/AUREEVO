import React from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
