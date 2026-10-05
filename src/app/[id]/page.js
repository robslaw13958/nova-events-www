import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/getProducts';
import { opisExcerpt } from '@/lib/opis';
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

  return {
    title: `${product.name} — Nova Events`,
    description: metaDescription(product),
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = findProduct(products, id);

  if (!product) notFound();

  return <ProductPageClient product={product} related={relatedProducts(products, product)} />;
}
