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

const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID || 'TWOJ_SHEET_ID';
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

// ─── Parser CSV (obsługuje cudzysłowy) ────────────────────────────────────────
function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    values.push(cur.trim());

    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

// Parsowanie ceny "90,00" → 90
function parseCenaFloat(raw = '') {
  return parseFloat(raw.replace(',', '.')) || 0;
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
        sztaplowanie: parseInt(row['sztaplowanie'] || '0', 10),
        zestaw: row['Zestaw']?.toLowerCase() === 'true',
        opis: row['Opis'] || '',
        wymiary: row['Wymiary'] || '',
        warianty: [],
      });
    }

    const produkt = map.get(key);

    produkt.warianty.push({
      kolor: row['Kolor'] || '',
      hex: colorToHex(row['Kolor']),
      cenaHurt: row['Cena Hurt [zł]'] || '',
      cenaDetal: row['Cena Detal [zł]'] || '',
      cenaHurtNum: parseCenaFloat(row['Cena Hurt [zł]']),
      cenaDetalNum: parseCenaFloat(row['Cena Detal [zł]']),
      outlet: row['Outlet']?.toLowerCase() === 'true',
      dostepnosc: row['Dostępność'] || '',
      zdjecie: row['Zdjęcie'] || '',
    });

    // Jeśli brak głównego zdjęcia, uzupełnij z wariantu
    if (!produkt.zdjecie && row['Zdjęcie']) {
      produkt.zdjecie = row['Zdjęcie'];
    }
    // Dostępność — nadpisz jeśli lepsza informacja
    if (row['Dostępność']) {
      produkt.dostepnosc = row['Dostępność'];
    }
  }

  return Array.from(map.values());
}

// ─── Ekstrakcja opcji filtrów ─────────────────────────────────────────────────
export function buildFilters(products) {
  const typy = [...new Set(products.map(p => p.typ).filter(Boolean))].sort();
  const linie = [...new Set(products.map(p => p.linia).filter(Boolean))].sort();

  return { typy, linie };
}

// ─── Główna funkcja eksportowana ──────────────────────────────────────────────
export async function getProducts() {
  try {
    const res = await fetch(SHEETS_CSV_URL, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Sheets HTTP ${res.status}`);
    const text = await res.text();
    const rows = parseCsv(text);
    return groupProducts(rows);
  } catch (err) {
    console.error('[getProducts] Błąd pobierania arkusza:', err.message);
    return FALLBACK_PRODUCTS;
  }
}

// ─── Dane zastępcze (gdy arkusz niedostępny) ───────────────────────────────────
const FALLBACK_PRODUCTS = groupProducts([
  { ID: '1', Produkt: 'Krzesło bankietowe_PREMIUM_krzesło_18_', Nazwa: 'Krzesło bankietowe', Cena: '90zł', Kolor: 'Granatowy', Linia: 'PREMIUM', Typ: 'krzesło', sztaplowanie: '18', Składanie: 'FALSE', Outlet: 'TRUE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Ostatnie sztuki' },
  { ID: '2', Produkt: 'Krzesło bankietowe_PREMIUM_krzesło_18_', Nazwa: 'Krzesło bankietowe', Cena: '90zł', Kolor: 'Bordowy', Linia: 'PREMIUM', Typ: 'krzesło', sztaplowanie: '18', Składanie: 'FALSE', Outlet: 'TRUE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Ostatnie sztuki' },
  { ID: '4', Produkt: 'Krzesło cateringowe_CLASSIC_krzesło_SK_0_', Nazwa: 'Krzesło cateringowe', Cena: '45zł', Kolor: 'Czarny', Linia: 'CLASSIC', Typ: 'krzesło', sztaplowanie: '0', Składanie: 'TRUE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Dostępne w magazynie' },
  { ID: '10', Produkt: 'Stół cateringowy__stół_SK_0_A', Nazwa: 'Stół cateringowy', Cena: '150zł', Kolor: 'Czarny', Linia: '', Typ: 'stół', sztaplowanie: '0', Składanie: 'TRUE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Dostępne w magazynie' },
  { ID: '11', Produkt: 'Stół cateringowy__stół_SK_0_A', Nazwa: 'Stół cateringowy', Cena: '150zł', Kolor: 'Biały', Linia: '', Typ: 'stół', sztaplowanie: '0', Składanie: 'TRUE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Dostępne w magazynie' },
  { ID: '20', Produkt: 'Krzesło Chiavari__krzesło_10_', Nazwa: 'Krzesło Chiavari', Cena: '120zł', Kolor: 'Złoty', Linia: '', Typ: 'krzesło', sztaplowanie: '10', Składanie: 'FALSE', Outlet: 'FALSE', Zestaw: 'FALSE', Zdjęcie: '', Opis: '', Wymiary: '', Dostępność: 'Wkrótce dostępne' },
]);
