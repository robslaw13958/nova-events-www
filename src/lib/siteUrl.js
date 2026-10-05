// Adres strony do linków bezwzględnych (podglądy linków, sitemap, dane strukturalne).
// Kolejność: jawnie ustawiony NEXT_PUBLIC_SITE_URL → adres produkcyjny projektu na Vercelu
// (zmienna systemowa) → adres lokalny. Tylko po stronie serwera.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000'
).replace(/\/$/, '');

// Wspólne ustawienia podglądu linków; strony produktów nadpisują tytuł, opis i adres
export const OPEN_GRAPH_DEFAULTS = {
  siteName: 'Nova Events',
  locale: 'pl_PL',
  type: 'website',
};
