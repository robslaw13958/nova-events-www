import { SITE_URL } from '@/lib/siteUrl';
import { getProducts } from '@/lib/getProducts';

export default async function sitemap() {
  const products = await getProducts();

  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/${encodeURIComponent(p.id)}`,
    lastModified: new Date(),
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/zamowienia-hurtowe`, lastModified: new Date() },
    { url: `${SITE_URL}/o-nas`, lastModified: new Date() },
    { url: `${SITE_URL}/kontakt`, lastModified: new Date() },
    ...productUrls,
  ];
}
