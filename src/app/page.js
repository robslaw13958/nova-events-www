import { getProducts } from '@/lib/getProducts';
import { buildAutoFilters } from '@/lib/autoFilters';
import CatalogClient from './CatalogClient';

export default async function Home() {
  const products = await getProducts();
  const filters  = buildAutoFilters(products);

  return <CatalogClient products={products} filters={filters} />;
}
