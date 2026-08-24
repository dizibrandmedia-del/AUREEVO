import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureevo.com';

    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        brand: true,
        category: true,
        inventories: true,
        variants: true,
      },
    });

    const itemsXml = products
      .map((p) => {
        const images = p.images ? JSON.parse(p.images) : [];
        const imageUrl = images[0] || `${baseUrl}/images/aureevo-logo.png`;
        const inStock =
          (p.inventories?.[0]?.currentStock || 0) > 0 ||
          p.variants.some((v) => v.stock > 0);

        return `
    <item>
      <g:id>${p.sku || p.id}</g:id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${p.shortDescription || p.description || p.name}]]></g:description>
      <g:link>${baseUrl}/product/${p.slug}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.sellingPrice.toFixed(2)} INR</g:price>
      <g:brand><![CDATA[${p.brand?.name || 'AUREEVO'}]]></g:brand>
      <g:product_type><![CDATA[${p.category?.name || 'Luxury Formulation'}]]></g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>White-Glove Express</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>AUREEVO — THE WORLD OF LUXURY</title>
    <link>${baseUrl}</link>
    <description>Official Google Merchant Product Feed for AUREEVO Luxury Maisons</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      `<?xml version="1.0"?><error>${err.message || 'Feed error'}</error>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
