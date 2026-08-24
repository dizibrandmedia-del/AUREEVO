'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Radio,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';

export default function StoreSettingsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'business' | 'branding' | 'general' | 'integrations'>('business');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Settings State Map
  const [settings, setSettings] = useState<Record<string, string>>({
    business_name: 'AUREEVO Luxury Retail Private Limited',
    business_tagline: 'THE WORLD OF LUXURY.',
    business_email: 'concierge@aureevo.com',
    business_phone: '+91 22 8900 1200',
    business_address: 'Level 14, The Oberoi Grand Arcade, Nariman Point, Mumbai - 400021',
    primary_color: '#071a14',
    accent_gold: '#d4af37',
    logo_url: '/images/aureevo-logo.png',
    favicon_url: '/favicon.png',
    default_currency: 'INR',
    currency_symbol: '₹',
    timezone: 'Asia/Kolkata',
    default_tax_rate: '18.0',
    payment_gateway: 'razorpay',
    shipping_partner: 'bluedart_luxury',
    email_provider: 'smtp_ses',
    whatsapp_provider: 'interakt',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.raw) {
          const map: Record<string, string> = {};
          data.data.raw.forEach((s: any) => {
            map[s.key] = s.value;
          });
          setSettings((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => error('Failed to load settings'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (data.success) {
        success('Store configuration updated successfully');
      } else {
        error(data.error || 'Failed to update settings');
      }
    } catch {
      error('Network error during settings update');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Storefront Configuration & Parameters
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Centralized business credentials, luxury brand palette, tax parameters, and partner connectors.
          </p>
        </div>

        <Button
          type="button"
          variant="gold"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save All Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-luxury-card/90 border border-luxury-border">
        {[
          { id: 'business', label: 'Business Profile', icon: <Building2 className="w-4 h-4" /> },
          { id: 'branding', label: 'Luxury Identity & Theme', icon: <Palette className="w-4 h-4" /> },
          { id: 'general', label: 'Localization & Taxes', icon: <Globe className="w-4 h-4" /> },
          { id: 'integrations', label: 'Service Connectors', icon: <Radio className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-luxury-gold text-luxury-darkest shadow-md shadow-luxury-gold/20'
                : 'text-luxury-muted hover:text-white hover:bg-luxury-surface/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <form onSubmit={handleSave}>
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === 'business' && (
            <Card className="space-y-5">
              <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
                Official Entity Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Legal Business Name"
                  value={settings.business_name || ''}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                />
                <Input
                  label="Official Brand Tagline"
                  value={settings.business_tagline || ''}
                  onChange={(e) => handleChange('business_tagline', e.target.value)}
                  disabled
                  helperText="Official source of truth: THE WORLD OF LUXURY."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Concierge Support Email"
                  type="email"
                  value={settings.business_email || ''}
                  onChange={(e) => handleChange('business_email', e.target.value)}
                />
                <Input
                  label="Concierge Phone Line"
                  value={settings.business_phone || ''}
                  onChange={(e) => handleChange('business_phone', e.target.value)}
                />
              </div>

              <Textarea
                label="Registered Luxury Headquarters Address"
                value={settings.business_address || ''}
                onChange={(e) => handleChange('business_address', e.target.value)}
                rows={2}
              />
            </Card>
          )}

          {/* TAB 2: LUXURY BRANDING */}
          {activeTab === 'branding' && (
            <Card className="space-y-5">
              <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
                Visual Identity & Official Brand Asset
              </h3>

              {/* Official Logo Banner */}
              <div className="p-4 rounded-2xl bg-luxury-emerald/40 border border-luxury-gold/40 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-luxury-darkest border border-luxury-gold/60 p-2 flex items-center justify-center shrink-0 shadow-xl shadow-luxury-gold/15">
                  <img
                    src={settings.logo_url || '/images/aureevo-logo.png'}
                    alt="AUREEVO Brand Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-luxury-gold" />
                    <h4 className="text-sm font-bold font-brand text-white">Official Brand Emblem (Locked)</h4>
                  </div>
                  <p className="text-xs text-luxury-muted mt-1 leading-relaxed">
                    The uploaded AUREEVO gold monogram crest is the official brand source of truth across customer storefront, navigation header, and admin login.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    Select Alternate Media Variant
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
                    Primary Luxury Deep Green
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primary_color || '#071a14'}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="w-12 h-10 rounded-xl bg-transparent cursor-pointer border border-luxury-border"
                    />
                    <Input
                      value={settings.primary_color || '#071a14'}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
                    Accent Metallic Gold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.accent_gold || '#d4af37'}
                      onChange={(e) => handleChange('accent_gold', e.target.value)}
                      className="w-12 h-10 rounded-xl bg-transparent cursor-pointer border border-luxury-border"
                    />
                    <Input
                      value={settings.accent_gold || '#d4af37'}
                      onChange={(e) => handleChange('accent_gold', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: GENERAL & TAXES */}
          {activeTab === 'general' && (
            <Card className="space-y-5">
              <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
                Localization & GST Rate Defaults
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Default Store Currency"
                  value={settings.default_currency || 'INR'}
                  onChange={(e) => handleChange('default_currency', e.target.value)}
                >
                  <option value="INR">INR (Indian Rupee - ₹)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                  <option value="AED">AED (UAE Dirham - د.إ)</option>
                </Select>

                <Select
                  label="Store Timezone"
                  value={settings.timezone || 'Asia/Kolkata'}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Europe/Paris">Europe/Paris (CET - UTC+1)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - UTC+4)</option>
                </Select>

                <Input
                  label="Standard GST / Tax Rate (%)"
                  type="number"
                  value={settings.default_tax_rate || '18.0'}
                  onChange={(e) => handleChange('default_tax_rate', e.target.value)}
                />
              </div>
            </Card>
          )}

          {/* TAB 4: SERVICE CONNECTORS */}
          {activeTab === 'integrations' && (
            <Card className="space-y-5">
              <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
                Enterprise Service Connectors (Phase 1 Ready Architecture)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Payment Gateway Provider"
                  value={settings.payment_gateway || 'razorpay'}
                  onChange={(e) => handleChange('payment_gateway', e.target.value)}
                >
                  <option value="razorpay">Razorpay Luxury Checkout (Active Connector)</option>
                  <option value="stripe">Stripe Global (Supported)</option>
                  <option value="cashfree">Cashfree Payments</option>
                </Select>

                <Select
                  label="Logistics & Courier Partner"
                  value={settings.shipping_partner || 'bluedart_luxury'}
                  onChange={(e) => handleChange('shipping_partner', e.target.value)}
                >
                  <option value="bluedart_luxury">Blue Dart Luxury White-Glove Surface</option>
                  <option value="delhivery">Delhivery Express</option>
                  <option value="dhl_express">DHL Express Worldwide</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Select
                  label="Transactional Email Provider"
                  value={settings.email_provider || 'smtp_ses'}
                  onChange={(e) => handleChange('email_provider', e.target.value)}
                >
                  <option value="smtp_ses">Amazon Simple Email Service (SES)</option>
                  <option value="sendgrid">Twilio SendGrid</option>
                  <option value="resend">Resend API</option>
                </Select>

                <Select
                  label="WhatsApp Concierge Provider"
                  value={settings.whatsapp_provider || 'interakt'}
                  onChange={(e) => handleChange('whatsapp_provider', e.target.value)}
                >
                  <option value="interakt">Interakt (WhatsApp Business Official)</option>
                  <option value="wati">Wati.io</option>
                  <option value="aisensy">AiSensy</option>
                </Select>
              </div>

              <div className="p-3 rounded-xl bg-luxury-surface/30 border border-luxury-border text-xs text-luxury-muted">
                <p className="font-semibold text-white mb-0.5">Security Compliance Note:</p>
                API access tokens and secret webhooks are securely parsed from server environment variables (<code className="text-luxury-gold">.env</code>) and are never stored in plain-text client tables.
              </div>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="gold" size="md" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
              Save Configuration
            </Button>
          </div>
        </form>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => handleChange('logo_url', url)}
        folder="branding"
      />
    </div>
  );
}
