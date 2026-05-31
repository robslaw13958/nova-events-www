'use server'; // Next.js Server Component (domyślne)

import { getProducts, buildFilters } from '@/lib/getProducts';
import CatalogClient from './CatalogClient';

export default async function Home() {
  const products = await getProducts();
  const filters  = buildFilters(products);

  // print products list
  console.log('Products:', products);
  console.log('Filters:', filters);

  return <CatalogClient products={products} filters={filters} />;
}
