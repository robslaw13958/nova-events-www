import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/getProducts';
import { opisExcerpt } from '@/lib/opis';
import { formatPrice } from '@/lib/format';
import { dostepnoscStatus } from '@/lib/dostepnosc';
import { SITE_URL, OPEN_GRAPH_DEFAULTS } from '@/lib/siteUrl';
import ProductPageClient from './ProductPageClient';

const RELATED_LIMIT = 4;

function findProduct(products, id) {
  return products.find(p => p.id === decodeURIComponent(id));
}

function metaDescription(p) {
  const parts = [];
  if (p.linia) parts.push(`Linia ${p.linia}`);
  if (p.wymiary) parts.push(p.wymiary);
  const excerpt = opisExcerpt(p.opis, 140);
  if (excerpt) parts.push(excerpt);
  return parts.join(' · ') || p.typ;
}

function priceLabel(p) {
  const prices = p.warianty.map(w => w.cenaDetalNum).filter(n => n > 0);
  if (!prices.length) return '';
  const min = Math.min(...prices);
  return `${Math.max(...prices) > min ? 'od ' : ''}${formatPrice(min)} zł`;
}

function productPath(p) {
  return `/${encodeURIComponent(p.id)}`;
}

// Najlepsza dostępność spośród wariantów, w słowniku schema.org
const AVAILABILITY = [
  ['dostepne', 'https://schema.org/InStock'],
  ['ostatnie', 'https://schema.org/LimitedAvailability'],
  ['wkrotce', 'https://schema.org/PreOrder'],
  ['niedostepne', 'https://schema.org/OutOfStock'],
];

function productJsonLd(p) {
  const statuses = new Set(p.warianty.filter(w => w.dostepnosc).map(w => dostepnoscStatus(w.dostepnosc)));
  const availability = AVAILABILITY.find(([status]) => statuses.has(status))?.[1];
  const prices = p.warianty.map(w => w.cenaDetalNum).filter(n => n > 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.id,
    url: `${SITE_URL}${productPath(p)}`,
    image: [...new Set(p.warianty.map(w => w.zdjecie).filter(Boolean))],
    description: opisExcerpt(p.opis, 300) || undefined,
    category: p.typ || undefined,
    color: [...new Set(p.warianty.map(w => w.kolor).filter(Boolean))].join(', ') || undefined,
    offers: prices.length ? {
      '@type': 'AggregateOffer',
      priceCurrency: 'PLN',
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: p.warianty.length,
      availability,
    } : undefined,
  };
}

// Produkty z tej samej linii mają pierwszeństwo przed produktami tego samego typu;
// przy remisie zostaje kolejność z katalogu.
function relatedProducts(products, product) {
  const score = p =>
    (product.linia && p.linia === product.linia ? 2 : 0) +
    (product.typ && p.typ === product.typ ? 1 : 0);

  return products
    .filter(p => p.id !== product.id)
    .map(p => ({ p, score: score(p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_LIMIT)
    .map(({ p }) => ({
      id: p.id,
      name: p.name,
      linia: p.linia,
      typ: p.typ,
      wymiary: p.wymiary,
      zdjecie: p.warianty.find(w => w.zdjecie)?.zdjecie || '',
      cenaOd: Math.min(...p.warianty.map(w => w.cenaDetalNum)),
    }));
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = findProduct(products, id);
  if (!product) return {};

  const description = metaDescription(product);
  const price = priceLabel(product);

  return {
    title: `${product.name} — Nova Events`,
    description,
    alternates: { canonical: productPath(product) },
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      title: product.name,
      // Cena na początku — w podglądzie linku często widać tylko pierwszą linię opisu
      description: [price, description].filter(Boolean).join(' · '),
      url: productPath(product),
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = findProduct(products, id);

  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, '\\u003c') }}
      />
      <ProductPageClient product={product} related={relatedProducts(products, product)} />
    </>
  );
}
