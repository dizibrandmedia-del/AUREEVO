'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Folder,
  RefreshCw,
  FileVideo,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import { formatDate } from '@/lib/utils';

export default function MediaLibraryPage() {
  const { success, error } = useToast();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (folder !== 'all') query.set('folder', folder);

      const res = await fetch(`/api/admin/media?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMediaList(data.data.media);
      } else {
        error(data.error || 'Failed to fetch media assets');
      }
    } catch {
      error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search, folder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder === 'all' ? 'general' : folder);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        success('Asset uploaded successfully');
        fetchMedia();
      } else {
        error(data.error || 'Failed to upload asset');
      }
    } catch {
      error('Upload error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('Asset URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async () => {
    if (!deletingMedia) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/media/${deletingMedia.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Asset deleted successfully');
        setIsDeleteDialogOpen(false);
        fetchMedia();
      } else {
        error(data.error || 'Failed to delete asset');
      }
    } catch {
      error('Network error deleting asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Media Asset Vault
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Ultra-secure repository for photography, certificates, video teasers, and brand crests.
          </p>
        </div>

        <div>
          <Button
            variant="gold"
            size="sm"
            isLoading={isUploading}
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload New Asset
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Filter and Folder Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-1.5 p-1 rounded-xl bg-luxury-surface/50 border border-luxury-border text-xs">
          {['all', 'products', 'brands', 'categories', 'branding', 'general'].map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap ${
                folder === f
                  ? 'bg-luxury-gold text-luxury-darkest font-semibold'
                  : 'text-luxury-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search assets by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-luxury-card/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ImageIcon className="w-12 h-12 text-luxury-gold mx-auto mb-3 opacity-70" />
          <h3 className="text-base font-bold text-white font-brand">No Media Assets Found</h3>
          <p className="text-xs text-luxury-muted mt-1 max-w-sm mx-auto">
            Upload images or promotional videos to enrich your product and brand showcases.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaList.map((item) => {
            const isVideo = item.mimeType.startsWith('video/');
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-luxury-card border border-luxury-border overflow-hidden hover:border-luxury-gold/50 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square bg-luxury-surface/50 overflow-hidden relative flex items-center justify-center p-1">
                  {isVideo ? (
                    <FileVideo className="w-12 h-12 text-luxury-gold" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="p-2 rounded-lg bg-luxury-darkest/90 border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-darkest transition-colors"
                      title="Copy Public URL"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setDeletingMedia(item);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-2 rounded-lg bg-luxury-darkest/90 border border-rose-800 text-rose-400 hover:bg-rose-950 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-luxury-dark/95 border-t border-luxury-border/60">
                  <p className="text-[11px] font-semibold text-white truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-luxury-muted mt-1">
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                    <span className="uppercase font-mono">{item.folder}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Media Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        message={`Are you sure you want to permanently delete "${deletingMedia?.originalName}"? This file will be removed from local storage and the database.`}
        confirmText="Delete Asset"
        isLoading={isDeleting}
      />
    </div>
  );
}
