/**
 * Buduje filtry katalogu automatycznie na podstawie kolumn arkusza — bez presetów.
 *
 * Każde pole zebrane w `product.fields` (patrz getProducts.js) jest klasyfikowane:
 * - same wartości TRUE/FALSE  → filtr typu 'boolean' (checkbox)
 * - 2–12 unikalnych wartości, z których przynajmniej jedna powtarza się
 *   u więcej niż jednego produktu → filtr typu 'select' (wielokrotny wybór)
 * - w przeciwnym razie (wolny tekst, zbyt duża różnorodność, brak powtórzeń)
 *   → pole pomijane jako kandydat na filtr
 *
 * Wymóg powtarzalności wartości (a nie tylko limit liczby unikalnych wartości)
 * chroni przed sytuacją, w której mały katalog (np. 10 produktów) sprawiłby,
 * że pole opisowe z niemal unikalnymi wartościami też stałoby się filtrem.
 */

const MAX_DISTINCT_VALUES = 12;

function isBooleanField(distinctValues) {
  return distinctValues.length > 0 && distinctValues.every(v => {
    const lower = v.toLowerCase();
    return lower === 'true' || lower === 'false';
  });
}

export function buildAutoFilters(products) {
  const fieldOrder = [];
  for (const product of products) {
    for (const field of Object.keys(product.fields)) {
      if (!fieldOrder.includes(field)) fieldOrder.push(field);
    }
  }

  const filters = [];

  for (const field of fieldOrder) {
    const distinct = new Set();
    const productsPerValue = new Map();

    for (const product of products) {
      for (const value of product.fields[field] || []) {
        distinct.add(value);
        productsPerValue.set(value, (productsPerValue.get(value) || 0) + 1);
      }
    }

    const distinctValues = Array.from(distinct);

    if (isBooleanField(distinctValues)) {
      filters.push({ field, label: field, type: 'boolean' });
      continue;
    }

    const hasRepeatedValue = Array.from(productsPerValue.values()).some(count => count >= 2);
    if (distinctValues.length >= 2 && distinctValues.length <= MAX_DISTINCT_VALUES && hasRepeatedValue) {
      const values = distinctValues.sort((a, b) =>
        a.localeCompare(b, 'pl', { numeric: true, sensitivity: 'base' })
      );
      filters.push({ field, label: field, type: 'select', values });
    }
  }

  return filters;
}

export function productMatchesFilter(product, field, type, selectedValues) {
  const values = product.fields[field] || [];
  if (type === 'boolean') {
    return values.some(v => v.toLowerCase() === 'true');
  }
  return values.some(v => selectedValues.includes(v));
}

export function matchesSearch(product, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (product.name.toLowerCase().includes(q)) return true;
  return Object.values(product.fields).some(values =>
    values.some(v => v.toLowerCase().includes(q))
  );
}
