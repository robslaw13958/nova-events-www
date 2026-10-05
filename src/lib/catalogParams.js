import { useSyncExternalStore } from 'react';

/**
 * Stan katalogu (filtry, wyszukiwanie, sortowanie) zapisany w adresie strony, np.
 *   /?Linia=PREMIUM&Kolor=Biały&Kolor=Czarny&Outlet=tak&szukaj=stół&sort=cena-rosnaco
 *
 * Klucze to nazwy kolumn arkusza (tak jak etykiety filtrów). Przy odczycie wielkość liter
 * nie ma znaczenia, a nieznane klucze i wartości są pomijane — link sklejony ręcznie
 * albo z nieaktualnym filtrem po prostu go zignoruje.
 */

export const SORT_OPTIONS = [
  { label: 'domyślny', param: null },
  { label: 'cena ↑',   param: 'cena-rosnaco' },
  { label: 'cena ↓',   param: 'cena-malejaco' },
];
export const DEFAULT_SORT = SORT_OPTIONS[0].label;

const SEARCH_KEY = 'szukaj';
const SORT_KEY = 'sort';
const TRUE_VALUES = new Set(['', 'tak', 'true', '1']);
const LAST_QUERY_KEY = 'catalog-query';

export function parseCatalogParams(searchParams, filters) {
  const byKey = new Map(filters.map(f => [f.field.toLowerCase(), f]));
  const selected = {};

  for (const key of new Set(searchParams.keys())) {
    const filter = byKey.get(key.toLowerCase());
    if (!filter) continue;

    if (filter.type === 'boolean') {
      if (TRUE_VALUES.has(searchParams.get(key).toLowerCase())) selected[filter.field] = true;
      continue;
    }

    const canonical = new Map(filter.values.map(v => [v.toLowerCase(), v]));
    const values = searchParams.getAll(key)
      .map(v => canonical.get(v.toLowerCase()))
      .filter(Boolean);
    if (values.length) selected[filter.field] = [...new Set(values)];
  }

  const sortParam = searchParams.get(SORT_KEY);
  const sortBy = SORT_OPTIONS.find(o => o.param && o.param === sortParam)?.label ?? DEFAULT_SORT;

  return { selected, search: searchParams.get(SEARCH_KEY) ?? '', sortBy };
}

// Kolejność parametrów jak kolejność filtrów — ten sam wybór daje zawsze ten sam link
export function buildCatalogQuery({ selected, search, sortBy }, filters) {
  const params = new URLSearchParams();

  for (const f of filters) {
    const value = selected[f.field];
    if (f.type === 'boolean') {
      if (value) params.set(f.field, 'tak');
    } else if (Array.isArray(value)) {
      value.forEach(v => params.append(f.field, v));
    }
  }

  if (search.trim()) params.set(SEARCH_KEY, search.trim());
  const sortParam = SORT_OPTIONS.find(o => o.label === sortBy)?.param;
  if (sortParam) params.set(SORT_KEY, sortParam);

  return params.toString();
}

// Ostatnie zestawienie z katalogu — link „Katalog” na stronie produktu wraca do niego
export function rememberCatalogQuery(query) {
  try {
    sessionStorage.setItem(LAST_QUERY_KEY, query);
  } catch {
    // tryb prywatny / zablokowany storage — link wróci do pełnego katalogu
  }
}

function readCatalogQuery() {
  try {
    return sessionStorage.getItem(LAST_QUERY_KEY) || '';
  } catch {
    return '';
  }
}

const noSubscribe = () => () => {};

export function useCatalogHref() {
  const query = useSyncExternalStore(noSubscribe, readCatalogQuery, () => '');
  return query ? `/?${query}` : '/';
}
