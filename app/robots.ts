import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/shop', '/product/', '/category/', '/brand/', '/images/'],
      disallow: [
        '/admin/',
        '/account/',
        '/cart',
        '/checkout',
        '/checkout/',
        '/api/',
        '/auth/',
        '/*?*sort=',
        '/*?*filter=',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
