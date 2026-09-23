import { db } from "./db";

// Global cache object stored on globalThis to persist across module reloads in Node.js
const globalForCache = globalThis as unknown as {
  catalogCache: Map<string, { data: any; expiry: number }> | undefined;
};

const cache = globalForCache.catalogCache ?? new Map<string, { data: any; expiry: number }>();
globalForCache.catalogCache = cache;

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds TTL

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && cached.expiry > now) {
    return cached.data as T;
  }

  try {
    const data = await fetcher();
    cache.set(key, { data, expiry: now + ttlMs });
    return data;
  } catch (error) {
    // If fresh fetch fails but stale data is available, return stale data as resilient fallback
    if (cached) {
      console.warn(`Fetch failed for key ${key}, serving stale cached data:`, error);
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Invalidate all or specific keys in the catalog cache.
 * Called immediately by Admin mutation API endpoints (products, categories, pricing, etc.)
 */
export function invalidateCatalogCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
  } else {
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  }
}

// ----------------- Pre-composed High-Performance Cached Getters -----------------

export async function getCachedCategories() {
  return fetchWithCache("catalog:categories", async () => {
    return db.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
        _count: { select: { products: true } },
      },
      orderBy: { displayOrder: "asc" },
    });
  });
}

export async function getCachedBrands() {
  return fetchWithCache("catalog:brands", async () => {
    return db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  });
}

export async function getCachedWeddingPackages() {
  return fetchWithCache("catalog:weddingPackages", async () => {
    return db.weddingPackage.findMany({
      where: { isActive: true },
      orderBy: { packagePrice: "asc" },
    });
  });
}

export async function getCachedHomeProducts() {
  return fetchWithCache("catalog:homeProducts", async () => {
    return db.product.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
  });
}

export async function getCachedDeals() {
  return fetchWithCache("catalog:deals", async () => {
    return db.product.findMany({
      where: {
        status: "PUBLISHED",
        discountPercent: { gte: 15 },
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
      },
      orderBy: { discountPercent: "desc" },
      take: 40,
    });
  });
}

export async function getCachedProductBySlug(slug: string) {
  return fetchWithCache(`catalog:product:${slug}`, async () => {
    return db.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "PUBLISHED",
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
      },
    });
  });
}

export async function getCachedRelatedProducts(categoryId: string, excludeProductId: string) {
  return fetchWithCache(`catalog:related:${categoryId}:${excludeProductId}`, async () => {
    return db.product.findMany({
      where: {
        categoryId,
        id: { not: excludeProductId },
        status: "PUBLISHED",
      },
      include: {
        brand: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 4,
    });
  });
}

export async function getCachedCategoryWithSubs(slug: string) {
  return fetchWithCache(`catalog:cat_with_subs:${slug}`, async () => {
    let cat = await db.category.findUnique({
      where: { slug },
      include: { subcategories: true },
    });
    if (!cat) {
      const sub = await db.subcategory.findUnique({
        where: { slug },
        include: {
          category: { include: { subcategories: true } },
        },
      });
      if (sub) {
        return { category: sub.category, activeSubSlug: sub.slug };
      }
    }
    return cat ? { category: cat, activeSubSlug: null } : null;
  });
}

export async function getCachedCategoryProducts(where: any, orderBy: any) {
  const key = `catalog:prods:${JSON.stringify(where)}:${JSON.stringify(orderBy)}`;
  return fetchWithCache(key, async () => {
    return db.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        attributes: true,
      },
      orderBy,
    });
  });
}

