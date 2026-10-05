'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseCatalogParams } from '@/lib/catalogParams';
import CatalogClient from './CatalogClient';

// Odczytuje filtry z adresu tylko raz, przy wejściu na stronę; dalej stan trzyma
// CatalogClient, a adres jest jedynie aktualizowany (history.replaceState).
export default function CatalogFromUrl({ products, filters }) {
  const searchParams = useSearchParams();
  const [initialState] = useState(() => parseCatalogParams(searchParams, filters));

  return <CatalogClient products={products} filters={filters} initialState={initialState} />;
}
