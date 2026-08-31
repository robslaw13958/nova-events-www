import { getProducts } from '@/lib/getProducts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novaevents.pl';

export default async function sitemap() {
  const products = await getProducts();

  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/${encodeURIComponent(p.id)}`,
    lastModified: new Date(),
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    ...productUrls,
  ];
}
