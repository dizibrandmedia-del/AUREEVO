'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import {
  Layers,
  Sparkles,
  Eye,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCmsPage() {
  const { success, error } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Section Modal
  const [editingSection, setEditingSection] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/cms/sections');
      const data = await res.json();
      if (data.success) {
        setSections(data.data.sections);
      } else {
        error(data.error || 'Failed to load CMS sections');
      }
    } catch {
      error('Failed to load CMS sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleActive = async (section: any) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: section.id,
          isActive: !section.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Section status updated');
        fetchSections();
      } else {
        error(data.error || 'Update failed');
      }
    } catch {
      error('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const current = sections[index];
    const target = sections[targetIndex];

    try {
      await Promise.all([
        fetch('/api/admin/cms/sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionId: current.id, sortOrder: target.sortOrder }),
        }),
        fetch('/api/admin/cms/sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionId: target.id, sortOrder: current.sortOrder }),
        }),
      ]);
      success('Section order updated');
      fetchSections();
    } catch {
      error('Failed to reorder sections');
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: editingSection.id,
          title,
          subtitle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Section content saved');
        setEditingSection(null);
        fetchSections();
      } else {
        error(data.error || 'Failed to save');
      }
    } catch {
      error('Network error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Homepage CMS & Layout Builder
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Dynamically enable, disable, reorder, and configure storefront sections and hero banners.
          </p>
        </div>

        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
            Preview Live Homepage
          </Button>
        </Link>
      </div>

      {/* Sections List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <Card
              key={section.id}
              className={`p-5 flex items-center justify-between gap-4 transition-all ${
                !section.isActive ? 'opacity-60 bg-luxury-dark/40' : 'hover:border-luxury-gold/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold font-mono font-bold text-xs shrink-0">
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-white font-brand">{section.title}</h3>
                    <Badge variant="gold" size="sm">
                      {section.type}
                    </Badge>
                  </div>
                  {section.subtitle && (
                    <p className="text-xs text-luxury-muted mt-0.5">{section.subtitle}</p>
                  )}
                  {section.banners?.length > 0 && (
                    <span className="text-[10px] text-luxury-gold-light font-mono block mt-1">
                      {section.banners.length} Active Slides Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-xl bg-luxury-surface/50 text-luxury-muted hover:text-white disabled:opacity-20"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === sections.length - 1}
                  className="p-2 rounded-xl bg-luxury-surface/50 text-luxury-muted hover:text-white disabled:opacity-20"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setEditingSection(section);
                    setTitle(section.title);
                    setSubtitle(section.subtitle || '');
                  }}
                  className="p-2 rounded-xl bg-luxury-surface/50 text-luxury-muted hover:text-luxury-gold"
                  title="Edit Content"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleActive(section)}
                  disabled={isUpdating}
                  className={`p-2 rounded-xl border transition-colors ${
                    section.isActive
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-800 text-rose-400'
                  }`}
                  title={section.isActive ? 'Disable Section' : 'Enable Section'}
                >
                  {section.isActive ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Section Modal */}
      <Modal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        title="Edit Homepage Section"
        subtitle={`Configure headline & description for ${editingSection?.type}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <Input
            label="Section Display Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Section Subtitle / Tagline"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-luxury-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
