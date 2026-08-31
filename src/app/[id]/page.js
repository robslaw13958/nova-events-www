import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/getProducts';
import ProductPageClient from './ProductPageClient';

function findProduct(products, id) {
  return products.find(p => p.id === decodeURIComponent(id));
}

function metaDescription(p) {
  const parts = [];
  if (p.linia) parts.push(`Linia ${p.linia}`);
  if (p.wymiary) parts.push(p.wymiary);
  if (p.opis) parts.push(p.opis);
  return parts.join(' · ') || p.typ;
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

  return <ProductPageClient product={product} />;
}
