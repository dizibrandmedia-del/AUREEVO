export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AUREEVO',
    alternateName: 'AUREEVO — THE WORLD OF LUXURY',
    url: baseUrl,
    logo: `${baseUrl}/images/aureevo-logo.png`,
    description: 'AUREEVO is an iconic luxury maison curating world-class personal care, rare botanical elixirs, and bespoke formulations.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-22-8877-6655',
      contactType: 'Customer VIP Concierge',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://www.instagram.com/aureevo',
      'https://twitter.com/aureevoluxury',
      'https://www.facebook.com/aureevo',
    ],
  };
}

export function getWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AUREEVO — THE WORLD OF LUXURY',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export function getProductSchema(product: any, reviews: any[] = []) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com';
  const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
  const primaryImage = images[0] || `${baseUrl}/images/aureevo-logo.png`;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.length > 0 ? images : [primaryImage],
    description: product.shortDescription || product.description || 'Luxury formulation from AUREEVO Maison.',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'AUREEVO',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.sellingPrice,
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inventories?.[0]?.currentStock > 0 || (product.variants && product.variants.some((v: any) => v.stock > 0))
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'AUREEVO',
      },
    },
  };

  // Only attach AggregateRating if actual database reviews exist
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };

    schema.review = reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        '@type': 'Person',
        name: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Verified Client',
      },
      datePublished: new Date(r.createdAt).toISOString().split('T')[0],
      reviewBody: r.comment,
    }));
  }

  return schema;
}
