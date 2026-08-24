'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Upload, Image as ImageIcon, Check, Search, Loader2 } from 'lucide-react';
import { useToast } from './ToastContext';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  folder?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  folder = 'general',
}: MediaPickerModalProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/media?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setMediaList(data.data.media);
      }
    } catch {
      error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        success('Media uploaded successfully');
        onSelect(data.data.media.url);
        onClose();
      } else {
        error(data.error || 'Upload failed');
      }
    } catch {
      error('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="flex items-center gap-2 border-b border-luxury-border pb-3 mb-4">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'library'
              ? 'bg-luxury-gold text-luxury-darkest'
              : 'text-luxury-muted hover:text-white'
          }`}
        >
          Media Library
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'upload'
              ? 'bg-luxury-gold text-luxury-darkest'
              : 'text-luxury-muted hover:text-white'
          }`}
        >
          Direct Upload
        </button>
      </div>

      {activeTab === 'library' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search media files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-luxury-dark/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchMedia}>
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-luxury-gold" />
            </div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-10 text-luxury-muted text-xs">
              No media files found. Upload an image above.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {mediaList.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer aspect-square bg-luxury-surface/40 transition-all ${
                      isSelected
                        ? 'border-luxury-gold ring-2 ring-luxury-gold shadow-lg shadow-luxury-gold/20'
                        : 'border-luxury-border/80 hover:border-luxury-muted'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-luxury-gold text-luxury-darkest flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white truncate">{item.originalName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-luxury-border">
            <span className="text-xs text-luxury-muted">
              {selectedUrl ? 'Asset selected' : 'Click an image to select'}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleConfirmSelection}
                disabled={!selectedUrl}
              >
                Use Selected Asset
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8">
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-luxury-gold/40 hover:border-luxury-gold rounded-2xl cursor-pointer bg-luxury-emerald/20 transition-all">
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-luxury-gold animate-spin mb-2" />
            ) : (
              <Upload className="w-10 h-10 text-luxury-gold mb-2" />
            )}
            <span className="text-sm font-semibold text-white">
              {isUploading ? 'Uploading & Processing...' : 'Click to Upload Asset'}
            </span>
            <span className="text-xs text-luxury-muted mt-1">PNG, JPG, WEBP, SVG or MP4 (Max 15MB)</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </Modal>
  );
}
