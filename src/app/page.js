import { Suspense } from 'react';
import { getProducts } from '@/lib/getProducts';
import { buildAutoFilters } from '@/lib/autoFilters';
import CatalogClient from './CatalogClient';
import CatalogFromUrl from './CatalogFromUrl';

export default async function Home() {
  const products = await getProducts();
  const filters  = buildAutoFilters(products);

  // Filtry z adresu (useSearchParams) są znane dopiero w przeglądarce. Fallback to pełny
  // katalog bez filtrów — dzięki temu strona nadal generuje się statycznie z produktami w HTML.
  return (
    <Suspense fallback={<CatalogClient products={products} filters={filters} />}>
      <CatalogFromUrl products={products} filters={filters} />
    </Suspense>
  );
}
