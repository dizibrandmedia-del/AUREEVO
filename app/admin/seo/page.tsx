'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { Globe, Search, Share2, FileCode, CheckCircle2, ExternalLink } from 'lucide-react';

export default function AdminSeoPage() {
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [seoConfig, setSeoConfig] = useState({
    metaTitle: 'AUREEVO — The World of Luxury',
    metaDescription:
      'The premier luxury multi-category e-commerce platform. Formulated skincare, haute parfumerie, and rare artisanal beauty.',
    canonicalDomain: 'https://aureevo.com',
    ogImage: '/images/aureevo-logo.png',
    twitterHandle: '@aureevoluxury',
    keywords: 'luxury skincare, haute perfumery, gold elixir, 24k beauty, premium cosmetics India',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      success('SEO Meta Configuration updated successfully');
    } catch (err: any) {
      error('Failed to save SEO configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-brand text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-luxury-gold" />
            SEO & Search Engine Indexing
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Configure search engine metadata, Open Graph previews, and verify automated discovery feeds.
          </p>
        </div>
      </div>

      {/* Discovery Feeds Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-luxury-card/30 border-luxury-border flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-luxury-gold" />
              Dynamic Sitemap
            </div>
            <div className="text-[11px] text-luxury-muted">XML Sitemap for Google Bot</div>
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-luxury-gold hover:underline flex items-center gap-1"
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        </Card>

        <Card className="p-4 bg-luxury-card/30 border-luxury-border flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-luxury-gold" />
              Robots.txt
            </div>
            <div className="text-[11px] text-luxury-muted">Crawler route directives</div>
          </div>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-luxury-gold hover:underline flex items-center gap-1"
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        </Card>

        <Card className="p-4 bg-luxury-card/30 border-luxury-border flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-luxury-gold" />
              Merchant Product Feed
            </div>
            <div className="text-[11px] text-luxury-muted">Google Shopping RSS 2.0</div>
          </div>
          <a
            href="/api/feeds/google-merchant"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-luxury-gold hover:underline flex items-center gap-1"
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        </Card>
      </div>

      {/* Global Metadata Form */}
      <Card className="p-6 bg-luxury-card/40 border-luxury-border space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-luxury-gold border-b border-luxury-border/60 pb-3">
          Global Search Engine Presets
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Global Meta Title"
              value={seoConfig.metaTitle}
              onChange={(e) => setSeoConfig({ ...seoConfig, metaTitle: e.target.value })}
              helperText="Recommended max 60 characters for search snippet visibility."
            />
            <Input
              label="Canonical Domain"
              value={seoConfig.canonicalDomain}
              onChange={(e) => setSeoConfig({ ...seoConfig, canonicalDomain: e.target.value })}
              helperText="Primary domain to eliminate duplicate content issues."
            />
          </div>

          <Textarea
            label="Global Meta Description"
            value={seoConfig.metaDescription}
            onChange={(e) => setSeoConfig({ ...seoConfig, metaDescription: e.target.value })}
            rows={3}
            helperText="Recommended 140–160 characters for optimum CTR on Google SERP."
          />

          <Input
            label="Keywords & Phrases"
            value={seoConfig.keywords}
            onChange={(e) => setSeoConfig({ ...seoConfig, keywords: e.target.value })}
            helperText="Comma-separated meta keywords."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Default Open Graph Image URL"
              value={seoConfig.ogImage}
              onChange={(e) => setSeoConfig({ ...seoConfig, ogImage: e.target.value })}
              helperText="Displayed when link is shared on WhatsApp, iMessage, and social media."
            />
            <Input
              label="Twitter / X Creator Handle"
              value={seoConfig.twitterHandle}
              onChange={(e) => setSeoConfig({ ...seoConfig, twitterHandle: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="gold" size="md" isLoading={isSaving}>
              Save SEO Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
