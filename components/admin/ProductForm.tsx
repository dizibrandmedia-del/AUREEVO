'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  Image as ImageIcon,
  Boxes,
  Globe,
  Plus,
  Trash2,
  Upload,
  Check,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import { useToast } from '@/components/ui/ToastContext';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<
    'basic' | 'content' | 'pricing' | 'media' | 'variants' | 'seo'
  >('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Meta Options
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTargetIndex, setMediaTargetIndex] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [brandId, setBrandId] = useState(initialData?.brandId || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [productType, setProductType] = useState<'SIMPLE' | 'VARIABLE'>(
    initialData?.productType || 'SIMPLE'
  );
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>(
    initialData?.status || 'DRAFT'
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);

  // Content
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ingredients, setIngredients] = useState(initialData?.ingredients || '');
  const [howToUse, setHowToUse] = useState(initialData?.howToUse || '');

  // Dynamic Lists
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights ? JSON.parse(initialData.highlights) : ['']
  );
  const [benefits, setBenefits] = useState<string[]>(
    initialData?.benefits ? JSON.parse(initialData.benefits) : ['']
  );
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>(
    initialData?.specifications
      ? Object.entries(JSON.parse(initialData.specifications)).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [{ key: 'Formulation', value: '' }]
  );

  // Pricing
  const [mrp, setMrp] = useState(initialData?.mrp ? String(initialData.mrp) : '0');
  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice ? String(initialData.sellingPrice) : '0'
  );
  const [taxRate, setTaxRate] = useState(initialData?.taxRate ? String(initialData.taxRate) : '18.0');

  // Media
  const [images, setImages] = useState<string[]>(
    initialData?.images ? JSON.parse(initialData.images) : []
  );
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');

  // Simple Stock & Warehouse
  const [initialStock, setInitialStock] = useState(
    initialData?.inventories?.[0]?.currentStock
      ? String(initialData.inventories[0].currentStock)
      : '10'
  );

  // Variants Matrix
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock || 0,
      image: v.image || '',
      status: v.status || 'ACTIVE',
      attributes: v.attributes ? JSON.parse(v.attributes) : {},
    })) || []
  );

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags ? JSON.parse(initialData.tags).join(', ') : ''
  );

  // Load Categories, Brands, Attributes
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
      fetch('/api/admin/attributes').then((r) => r.json()),
    ])
      .then(([catRes, brandRes, attrRes]) => {
        if (catRes.success) setCategories(catRes.data.categories);
        if (brandRes.success) setBrands(brandRes.data.brands);
        if (attrRes.success) setAttributes(attrRes.data.attributes);

        if (!categoryId && catRes.success && catRes.data.categories.length > 0) {
          setCategoryId(catRes.data.categories[0].id);
        }
      })
      .catch(() => error('Failed to load catalogue lookup options'));
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
      if (!sku && val.length > 3) {
        setSku(
          'AUR-' +
            val
              .split(' ')
              .map((w) => w[0]?.toUpperCase())
              .join('')
              .slice(0, 4) +
            '-' +
            Math.floor(100 + Math.random() * 900)
        );
      }
    }
  };

  // Calculations
  const calculatedDiscount =
    parseFloat(mrp) > 0 && parseFloat(sellingPrice) > 0
      ? Math.max(0, ((parseFloat(mrp) - parseFloat(sellingPrice)) / parseFloat(mrp)) * 100).toFixed(1)
      : '0';

  // Variant Helpers
  const addVariantRow = () => {
    const nextIndex = variants.length + 1;
    setVariants([
      ...variants,
      {
        sku: `${sku || 'AUR'}-VAR-${nextIndex}`,
        name: `Option ${nextIndex}`,
        mrp: parseFloat(mrp) || 0,
        price: parseFloat(sellingPrice) || 0,
        stock: 10,
        image: images[0] || '',
        status: 'ACTIVE',
        attributes: {},
      },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index: number, field: string, value: any) => {
    const next = [...variants];
    next[index][field] = value;
    setVariants(next);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetIndex !== null) {
      const next = [...variants];
      next[mediaTargetIndex].image = url;
      setVariants(next);
      setMediaTargetIndex(null);
    } else {
      setImages([...images, url]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku || !categoryId) {
      error('Please complete all required fields (Name, SKU, Category)');
      setActiveTab('basic');
      return;
    }

    if (productType === 'VARIABLE' && variants.length === 0) {
      error('Variable products require at least one variant matrix entry');
      setActiveTab('variants');
      return;
    }

    setIsSaving(true);

    const specsObj: Record<string, string> = {};
    specifications.forEach((s) => {
      if (s.key && s.value) specsObj[s.key] = s.value;
    });

    const parsedTags = tagsInput
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const payload = {
      name,
      slug: slug || slugify(name),
      sku,
      brandId: brandId || null,
      categoryId,
      productType,
      status,
      isFeatured,
      shortDescription: shortDescription || null,
      description: description || null,
      ingredients: ingredients || null,
      howToUse: howToUse || null,
      highlights: highlights.filter(Boolean),
      benefits: benefits.filter(Boolean),
      specifications: specsObj,
      mrp: parseFloat(mrp) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      discountPercent: parseFloat(calculatedDiscount),
      taxRate: parseFloat(taxRate) || 18.0,
      images,
      videoUrl: videoUrl || null,
      tags: parsedTags,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      initialStock: parseInt(initialStock, 10) || 0,
      variants: productType === 'VARIABLE' ? variants : [],
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        router.push('/admin/products');
        router.refresh();
      } else {
        error(data.error || 'Failed to save product');
      }
    } catch {
      error('Network error during product save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <button
              type="button"
              className="p-2 rounded-xl bg-luxury-surface/50 border border-luxury-border hover:bg-luxury-surface text-luxury-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
              {isEditing ? 'Edit Luxury Product' : 'Compose New Product'}
            </h1>
            <p className="text-xs text-luxury-muted">
              {sku ? `SKU: ${sku}` : 'Configure catalogue presentation, variant matrix, and pricing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="gold" size="md" isLoading={isSaving}>
            {isEditing ? 'Save Changes' : 'Publish Product'}
          </Button>
        </div>
      </div>

      {/* Luxury Tab Navigation Bar */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-luxury-card/90 border border-luxury-border">
        {[
          { id: 'basic', label: '1. Basic & Hierarchy', icon: <Package className="w-4 h-4" /> },
          { id: 'content', label: '2. Editorial & Content', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'pricing', label: '3. Pricing & Taxes', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'media', label: '4. Media Gallery', icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'variants', label: '5. Variants & Stock', icon: <Boxes className="w-4 h-4" /> },
          { id: 'seo', label: '6. SEO & Tags', icon: <Globe className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
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

      {/* TAB 1: BASIC INFO */}
      {activeTab === 'basic' && (
        <Card className="space-y-5">
          <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
            Catalogue Identity & Placement
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Title *"
              placeholder="e.g. AUREEVO 24K Imperial Gold Rejuvenating Serum"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />

            <Input
              label="Product SKU *"
              placeholder="AUR-SER-24K"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="URL Slug"
              placeholder="aureevo-24k-imperial-gold-rejuvenating-serum"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText="Unique canonical URL"
            />

            <Select
              label="Category Placement *"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent ? `${cat.parent.name} → ${cat.name}` : cat.name}
                </option>
              ))}
            </Select>

            <Select
              label="Brand Affiliation"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">AUREEVO Signature / Unassigned</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Select
              label="Product Architecture Type"
              value={productType}
              onChange={(e) => setProductType(e.target.value as any)}
            >
              <option value="SIMPLE">Simple Product (Single SKU & Stock)</option>
              <option value="VARIABLE">Variable Product (Multi-Variant Matrix)</option>
            </Select>

            <Select
              label="Publishing Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="DRAFT">DRAFT (Hidden from storefront)</option>
              <option value="ACTIVE">ACTIVE (Published & Purchasable)</option>
              <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
            </Select>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-muted">
                Spotlight Placement
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-luxury-border bg-luxury-dark text-luxury-gold focus:ring-luxury-gold"
                />
                <span>Showcase on Luxury Homepage Carousel</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: EDITORIAL & CONTENT */}
      {activeTab === 'content' && (
        <Card className="space-y-5">
          <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
            Editorial Storytelling & Specifications
          </h3>

          <Textarea
            label="Short Summary / Catchphrase"
            placeholder="Infused with pure 24-karat gold flakes and bio-identical peptides..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
          />

          <Textarea
            label="Detailed Narrative / Formulation Philosophy (HTML / Markdown)"
            placeholder="<p>Handcrafted in limited batches using antique French alembics...</p>"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Full Ingredient Composition"
              placeholder="Aqua, 24K Gold Flakes, Niacinamide, Kashmiri Saffron..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={3}
            />

            <Textarea
              label="Ritual & How To Use"
              placeholder="Warm 3-4 golden drops between palms and gently press onto cleansed facial contours..."
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              rows={3}
            />
          </div>

          {/* Key Highlights List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-luxury-muted">
                Key Product Highlights (Bullet points)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHighlights([...highlights, ''])}
              >
                + Add Highlight
              </Button>
            </div>
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="e.g. 24-hour hydration with zero greasy residue"
                  value={h}
                  onChange={(e) => {
                    const next = [...highlights];
                    next[i] = e.target.value;
                    setHighlights(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                  className="text-luxury-muted hover:text-rose-400 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Specifications Key-Value Pairs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-luxury-muted">
                Technical Specifications Table
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpecifications([...specifications, { key: '', value: '' }])}
              >
                + Add Spec
              </Button>
            </div>
            {specifications.map((s, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <Input
                    placeholder="Specification Key (e.g. Origin, Skin Type)"
                    value={s.key}
                    onChange={(e) => {
                      const next = [...specifications];
                      next[i].key = e.target.value;
                      setSpecifications(next);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Value (e.g. Switzerland / Grasse)"
                    value={s.value}
                    onChange={(e) => {
                      const next = [...specifications];
                      next[i].value = e.target.value;
                      setSpecifications(next);
                    }}
                  />
                </div>
                <div className="col-span-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => setSpecifications(specifications.filter((_, idx) => idx !== i))}
                    className="text-luxury-muted hover:text-rose-400 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: PRICING & TAXES */}
      {activeTab === 'pricing' && (
        <Card className="space-y-5">
          <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
            Commercial Pricing & GST Architecture
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Maximum Retail Price (MRP) *"
              type="number"
              placeholder="14500"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              required
            />

            <Input
              label="Selling Price (Net) *"
              type="number"
              placeholder="12500"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
            />

            <div className="p-3 rounded-xl bg-luxury-surface/50 border border-luxury-border flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-luxury-gold tracking-wider">
                Discount Calculated
              </span>
              <span className="text-xl font-bold font-brand text-white mt-0.5">
                {calculatedDiscount}% OFF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Applicable GST / Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              helperText="Default 18.0% for luxury cosmetics & perfumery"
            />
          </div>
        </Card>
      )}

      {/* TAB 4: MEDIA GALLERY */}
      {activeTab === 'media' && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-luxury-border pb-2">
            <h3 className="text-base font-bold font-brand text-white">Visual Assets Gallery</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMediaTargetIndex(null);
                setIsMediaPickerOpen(true);
              }}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              Add Asset from Library
            </Button>
          </div>

          {images.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-luxury-border rounded-2xl">
              <ImageIcon className="w-10 h-10 text-luxury-gold mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">No Product Images Attached</p>
              <p className="text-xs text-luxury-muted mt-1">Upload high-resolution photography.</p>
              <Button
                type="button"
                variant="gold"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setMediaTargetIndex(null);
                  setIsMediaPickerOpen(true);
                }}
              >
                Upload Images
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square rounded-2xl border border-luxury-border overflow-hidden bg-luxury-surface/40"
                >
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-luxury-gold text-luxury-darkest text-[10px] font-bold shadow">
                      Cover Image
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/80 text-rose-400 hover:text-rose-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-luxury-border">
            <Input
              label="Editorial Video URL (YouTube / Vimeo / MP4 CDN)"
              placeholder="https://cdn.aureevo.com/videos/product-showcase.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* TAB 5: VARIANTS & STOCK */}
      {activeTab === 'variants' && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-luxury-border pb-2">
            <div>
              <h3 className="text-base font-bold font-brand text-white">
                {productType === 'VARIABLE' ? 'Dynamic Variant Matrix' : 'Stock & Inventory Level'}
              </h3>
              <p className="text-xs text-luxury-muted">
                {productType === 'VARIABLE'
                  ? 'Each variant holds individual SKU, stock, pricing, and shade/volume attributes.'
                  : 'Manage initial central fulfillment stock for this simple SKU.'}
              </p>
            </div>

            {productType === 'VARIABLE' && (
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={addVariantRow}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Variant Entry
              </Button>
            )}
          </div>

          {productType === 'SIMPLE' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Central Warehouse Initial Stock"
                type="number"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                helperText="Auto-recorded in Stock History on save"
              />
            </div>
          ) : variants.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-luxury-border rounded-2xl">
              <Boxes className="w-10 h-10 text-luxury-gold mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">No Variants Defined</p>
              <p className="text-xs text-luxury-muted mt-1">
                Add options like 30ml, 50ml, or Shade variants.
              </p>
              <Button type="button" variant="gold" size="sm" className="mt-4" onClick={addVariantRow}>
                Add First Variant
              </Button>
            </div>
          ) : (
            <div className="space-y-3 overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-luxury-emerald/60 border-b border-luxury-border text-[10px] uppercase tracking-wider text-luxury-gold-light">
                  <tr>
                    <th className="p-2.5">Variant Name</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">MRP</th>
                    <th className="p-2.5">Selling Price</th>
                    <th className="p-2.5">Stock</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40">
                  {variants.map((v, i) => (
                    <tr key={i} className="hover:bg-luxury-surface/30">
                      <td className="p-2 min-w-[140px]">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                          placeholder="e.g. 50ml Flacon"
                          className="w-full bg-luxury-dark/90 border border-luxury-border rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="p-2 min-w-[140px]">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariantRow(i, 'sku', e.target.value)}
                          placeholder="SKU-VAR-1"
                          className="w-full bg-luxury-dark/90 border border-luxury-border rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          value={v.mrp}
                          onChange={(e) => updateVariantRow(i, 'mrp', parseFloat(e.target.value) || 0)}
                          className="w-full bg-luxury-dark/90 border border-luxury-border rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariantRow(i, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-luxury-dark/90 border border-luxury-border rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="p-2 w-20">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariantRow(i, 'stock', parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-luxury-dark/90 border border-luxury-border rounded-lg px-2 py-1.5 text-xs text-white font-bold"
                        />
                      </td>
                      <td className="p-2 w-28">
                        <select
                          value={v.status}
                          onChange={(e) => updateVariantRow(i, 'status', e.target.value)}
                          className="w-full bg-luxury-dark/90 border border-luxury-border rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(i)}
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 6: SEO & METADATA */}
      {activeTab === 'seo' && (
        <Card className="space-y-5">
          <h3 className="text-base font-bold font-brand text-white border-b border-luxury-border pb-2">
            Search Engine Discovery & Social Graph
          </h3>

          <Input
            label="SEO Meta Title"
            placeholder="AUREEVO 24K Imperial Gold Rejuvenating Serum | The World of Luxury"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            helperText="Appears as page title in search engine results"
          />

          <Textarea
            label="SEO Meta Description"
            placeholder="Shop the signature AUREEVO 24K Imperial Gold Rejuvenating Serum. Ultra-luxurious anti-aging youth elixir..."
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
          />

          <Input
            label="Search Tags (comma-separated)"
            placeholder="24k gold, luxury serum, anti-aging, youth elixir, haute beauty"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </Card>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        folder="products"
      />
    </form>
  );
}
