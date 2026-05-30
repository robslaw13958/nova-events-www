'use server'; // Next.js Server Component (domyślne)

import { getProducts, buildFilters } from '@/lib/getProducts';
import CatalogClient from './CatalogClient';

export default async function Home() {
  const products = await getProducts();
  const filters  = buildFilters(products);

  return <CatalogClient products={products} filters={filters} />;
}
