/**
 * lib/getProducts.js
 *
 * Pobiera dane z Google Sheets (opublikowanego jako CSV).
 *
 * Aby skonfigurować:
 * 1. Arkusz → Plik → Udostępnij → Opublikuj w internecie → CSV
 * 2. Skopiuj SHEET_ID z URL arkusza i wklej do .env.local:
 *    NEXT_PUBLIC_SHEET_ID=twój_id
 *    NEXT_PUBLIC_SHEET_GID=0        (numer zakładki, domyślnie 0)
 */

import Papa from 'papaparse';
import { isOpisNote } from './opis';

const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID || '112OyXCrzHvFSaZISEJJCIrQcq-Cs9t-4Nqr5dhtGfQE';
const SHEET_GID = process.env.NEXT_PUBLIC_SHEET_GID || '0';

const SHEETS_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

// ─── Kolory PL → HEX ──────────────────────────────────────────────────────────
const COLOR_MAP = {
  'biały': '#F5F2EC',
  'czarny': '#0c0c0a',
  'granatowy': '#142842',
  'bordowy': '#8B0000',
  'złoty': '#C8A96E',
  'srebrny': '#C0C0C0',
  'szary': '#6B7280',
  'brązowy': '#5C3D2E',
  'beżowy': '#D8D0C4',
  'ecru': '#F5F0E8',
  'zielony': '#2D5016',
  'czerwony': '#C0392B',
  'niebieski': '#1E3A5F',
  'kremowy': '#EDE9E1',
  'orzech': '#8B7355',
};

export function colorToHex(name = '') {
  return COLOR_MAP[name.toLowerCase().trim()] ?? '#888888';
}

// ─── Linki Google Drive → bezpośredni URL do obrazka ───────────────────────
// Wklejony w arkuszu link "Udostępnij" (.../file/d/ID/view?usp=sharing) nie jest
// bezpośrednim adresem obrazka — trzeba go zamienić na endpoint miniatury.
function normalizeImageUrl(url = '') {
  if (!url) return url;
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return url;
}

// ─── Parser CSV ────────────────────────────────────────────────────────────
function parseCsv(text) {
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  });
  return data;
}

// Parsowanie ceny "90,00" → 90, "22 500,00" → 22500 (spacja/twarda spacja jako separator tysięcy)
function parseCenaFloat(raw = '') {
  return parseFloat(raw.replace(/\s/g, '').replace(',', '.')) || 0;
}

// ─── Pola wyłączone z automatycznych filtrów (patrz lib/autoFilters.js) ────────
// Struktura/identyfikacja produktu, nie kategoria — nie ma sensu ich filtrować.
const NON_FILTERABLE_FIELDS = new Set([
  'ID', 'Produkt', 'Nazwa', 'Zdjęcie', 'Cena Hurt [zł]', 'Cena Detal [zł]',
]);

// Zbiera surowe wartości WSZYSTKICH pozostałych kolumn arkusza dla danego produktu,
// żeby filtry mogły powstawać automatycznie z dowolnej kolumny, bez zmian w kodzie.
function collectFields(target, row) {
  for (const [header, rawValue] of Object.entries(row)) {
    if (NON_FILTERABLE_FIELDS.has(header)) continue;
    const value = (rawValue ?? '').toString().trim();
    if (!value) continue;
    if (!target[header]) target[header] = [];
    if (!target[header].includes(value)) target[header].push(value);
  }
}

// ─── Grupowanie wierszy → produkty z wariantami ────────────────────────────────
function groupProducts(rows) {
  const map = new Map();

  for (const row of rows) {
    const key = row['Produkt'] || `${row['Nazwa']}_${row['ID']}`;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: row['Nazwa'] || '',
        linia: row['Linia'] || '',
        typ: row['Typ'] || '',
        skladanie: row['Składanie']?.toLowerCase() === 'true',
        sztaplowanie: parseInt(row['Sztaplowanie'] || '0', 10),
        zestaw: row['Zestaw']?.toLowerCase() === 'true',
        opis: '',
        wymiary: row['Wymiary'] || '',
        warianty: [],
        fields: {},
      });
    }

    const produkt = map.get(key);
    collectFields(produkt.fields, row);

    produkt.warianty.push({
      kolor: row['Kolor'] || '',
      hex: colorToHex(row['Kolor']),
      cenaHurt: row['Cena Hurt [zł]'] || '',
      cenaDetal: row['Cena Detal [zł]'] || '',
      cenaHurtNum: parseCenaFloat(row['Cena Hurt [zł]']),
      cenaDetalNum: parseCenaFloat(row['Cena Detal [zł]']),
      outlet: row['Outlet']?.toLowerCase() === 'true',
      dostepnosc: row['Dostępność'] || '',
      zdjecie: normalizeImageUrl(row['Zdjęcie'] || ''),
      opis: row['Opis'] || '',
    });

    // Opis produktu = pierwszy pełny opis wariantu (krótka notatka typu
    // „Lekkie zarysowania” przy wariancie outlet nie jest opisem produktu)
    if (!produkt.opis && row['Opis'] && !isOpisNote(row['Opis'])) {
      produkt.opis = row['Opis'];
    }

    // Jeśli brak głównego zdjęcia, uzupełnij z wariantu
    if (!produkt.zdjecie && row['Zdjęcie']) {
      produkt.zdjecie = normalizeImageUrl(row['Zdjęcie']);
    }
    // Dostępność — nadpisz jeśli lepsza informacja
    if (row['Dostępność']) {
      produkt.dostepnosc = row['Dostępność'];
    }
  }

  return Array.from(map.values());
}

// ─── Główna funkcja eksportowana ──────────────────────────────────────────────
// Dane z arkusza są w cache Vercela pod tagiem CATALOG_TAG. Skrypt w arkuszu
// (scripts/arkusz/odswiezanie-strony.gs) po każdej zmianie woła /api/revalidate,
// a odświeżanie co godzinę to tylko zabezpieczenie, gdyby wyzwalacz nie zadziałał.
export const CATALOG_TAG = 'catalog';
const SAFETY_REVALIDATE_SECONDS = 3600;

// Zwraca też źródło danych — strona /status pokazuje, gdy arkusz jest niedostępny
// i katalog działa na danych zastępczych.
export async function loadCatalog() {
  try {
    const res = await fetch(SHEETS_CSV_URL, {
      next: { tags: [CATALOG_TAG], revalidate: SAFETY_REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`Sheets HTTP ${res.status}`);
    const text = await res.text();
    const rows = parseCsv(text);
    return { products: groupProducts(rows), source: 'sheet', error: null };
  } catch (err) {
    console.error('[getProducts] Błąd pobierania arkusza:', err.message);
    return { products: FALLBACK_PRODUCTS, source: 'fallback', error: err.message };
  }
}

// Na produkcji błąd arkusza przerywa generowanie strony zamiast pokazać dane zastępcze:
// Vercel serwuje wtedy ostatnią dobrą wersję i ponawia próbę przy kolejnej wizycie,
// a nieudany build zostawia poprzedni deploy. Lokalnie (next dev) dane zastępcze zostają.
export async function getProducts() {
  const { products, source, error } = await loadCatalog();
  if (source !== 'sheet' && process.env.NODE_ENV === 'production') {
    throw new Error(`Arkusz niedostępny, strona nie zostanie odświeżona: ${error}`);
  }
  return products;
}

// ─── Dane zastępcze (gdy arkusz niedostępny) ───────────────────────────────────
const FALLBACK_PRODUCTS = groupProducts([
  { ID: '1', Produkt: 'Krzesło bankietowe_PREMIUM_krzesło_18_', Nazwa: 'Krzesło bankietowe', Kolor: 'Granatowy', Linia: 'PREMIUM', Typ: 'krzesło', Sztaplowanie: '18', Składanie: 'FALSE', Outlet: 'TRUE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Ostatnie sztuki' },
  { ID: '2', Produkt: 'Krzesło bankietowe_PREMIUM_krzesło_18_', Nazwa: 'Krzesło bankietowe', Kolor: 'Bordowy', Linia: 'PREMIUM', Typ: 'krzesło', Sztaplowanie: '18', Składanie: 'FALSE', Outlet: 'TRUE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Ostatnie sztuki' },
  { ID: '4', Produkt: 'Krzesło cateringowe_CLASSIC_krzesło_SK_0_', Nazwa: 'Krzesło cateringowe', Kolor: 'Czarny', Linia: 'CLASSIC', Typ: 'krzesło', Sztaplowanie: '0', Składanie: 'TRUE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Dostępne w magazynie' },
  { ID: '10', Produkt: 'Stół cateringowy__stół_SK_0_A', Nazwa: 'Stół cateringowy', Kolor: 'Czarny', Linia: '', Typ: 'stół', Sztaplowanie: '0', Składanie: 'TRUE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Dostępne w magazynie' },
  { ID: '11', Produkt: 'Stół cateringowy__stół_SK_0_A', Nazwa: 'Stół cateringowy', Kolor: 'Biały', Linia: '', Typ: 'stół', Sztaplowanie: '0', Składanie: 'TRUE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Dostępne w magazynie' },
  { ID: '20', Produkt: 'Krzesło Chiavari__krzesło_10_', Nazwa: 'Krzesło Chiavari', Kolor: 'Złoty', Linia: '', Typ: 'krzesło', Sztaplowanie: '10', Składanie: 'FALSE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Wkrótce dostępne' },
]);
