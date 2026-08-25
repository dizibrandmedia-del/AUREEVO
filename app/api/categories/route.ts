import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';

const FALLBACK_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Haute Parfumerie',
    slug: 'fragrance',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'Bespoke extraits de parfum distilled from Grasse rose and pure oud.',
    children: [
      { id: 'sub-1', name: 'Pure Parfums', slug: 'pure-parfums', children: [] },
      { id: 'sub-2', name: 'Artisanal Extraits', slug: 'artisanal-extraits', children: [] },
    ],
  },
  {
    id: 'cat-2',
    name: 'Cellular Skincare',
    slug: 'skincare',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    description: 'Rare Swiss 24K colloidal gold & royal saffron cellular formulations.',
    children: [
      { id: 'sub-3', name: 'Face Elixirs', slug: 'face-elixirs', children: [] },
      { id: 'sub-4', name: 'Gold Serums', slug: 'gold-serums', children: [] },
    ],
  },
  {
    id: 'cat-3',
    name: 'Artisanal Jewels',
    slug: 'jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted luxury pieces set in 18K solid gold and gemstones.',
    children: [
      { id: 'sub-5', name: 'Fine Necklaces', slug: 'fine-necklaces', children: [] },
      { id: 'sub-6', name: 'Statement Rings', slug: 'statement-rings', children: [] },
    ],
  },
  {
    id: 'cat-4',
    name: 'Maison Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    description: 'Fine Italian leather craftsmanship and bespoke silk creations.',
    children: [
      { id: 'sub-7', name: 'Silk Scarves', slug: 'silk-scarves', children: [] },
      { id: 'sub-8', name: 'Leather Goods', slug: 'leather-goods', children: [] },
    ],
  },
];

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        status: 'ACTIVE',
        parentId: null,
      },
      include: {
        children: {
          where: { status: 'ACTIVE' },
          include: {
            children: {
              where: { status: 'ACTIVE' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (categories && categories.length > 0) {
      return successResponse({ categories });
    }
    return successResponse({ categories: FALLBACK_CATEGORIES });
  } catch (err: any) {
    console.error('Categories API fallback triggered:', err);
    return successResponse({ categories: FALLBACK_CATEGORIES });
  }
}
