'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { BarChart3, Radio, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminMarketingPage() {
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [marketingConfig, setMarketingConfig] = useState({
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID || 'G-AUREEVO2026',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '123456789012345',
    googleSearchConsoleTag: 'google-site-verification=AUR_VERIFY_KEY_SAMPLE',
    googleMerchantCenterId: 'MC-88990011',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      success('Analytics & Marketing Integrations updated successfully');
    } catch {
      error('Failed to update integrations');
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
            <BarChart3 className="w-6 h-6 text-luxury-gold" />
            Marketing & Analytics Integrations
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Connect conversion tracking, Google Analytics 4, Meta Pixel, and advertising channels.
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6 bg-luxury-card/40 border-luxury-border space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-luxury-gold border-b border-luxury-border/60 pb-3">
          Tracking Pixels & Measurement IDs
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Google Analytics 4 (GA4) ID"
              value={marketingConfig.gaMeasurementId}
              onChange={(e) =>
                setMarketingConfig({ ...marketingConfig, gaMeasurementId: e.target.value })
              }
              helperText="Format: G-XXXXXXXXXX for e-commerce event streams."
            />
            <Input
              label="Meta (Facebook) Pixel ID"
              value={marketingConfig.metaPixelId}
              onChange={(e) =>
                setMarketingConfig({ ...marketingConfig, metaPixelId: e.target.value })
              }
              helperText="Tracks PageView, ViewContent, AddToCart, and Purchase."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Google Search Console Verification Tag"
              value={marketingConfig.googleSearchConsoleTag}
              onChange={(e) =>
                setMarketingConfig({
                  ...marketingConfig,
                  googleSearchConsoleTag: e.target.value,
                })
              }
              helperText="HTML tag or verification key."
            />
            <Input
              label="Google Merchant Center Account ID"
              value={marketingConfig.googleMerchantCenterId}
              onChange={(e) =>
                setMarketingConfig({
                  ...marketingConfig,
                  googleMerchantCenterId: e.target.value,
                })
              }
              helperText="Target account for automated product feed sync."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="gold" size="md" isLoading={isSaving}>
              Save Integrations
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
