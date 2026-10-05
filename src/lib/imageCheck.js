// Pobiera zdjęcie produktu i sprawdza, czy to faktycznie obrazek.
// Używane przez obrazki podglądu linków (opengraph-image.js) i stronę /status.

const TIMEOUT_MS = 8000;

// Format rozpoznawany po pierwszych bajtach pliku, a nie po nagłówku Content-Type —
// np. mextra.pl wysyła pliki PNG oznaczone jako image/jpeg.
function detectImageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (bytes.subarray(0, 3).toString() === 'GIF') return 'image/gif';
  return null;
}

function looksLikeHtml(bytes) {
  return /^\s*</.test(bytes.subarray(0, 64).toString());
}

/**
 * Zwraca { ok: true, type, bytes } albo { ok: false, problem } z opisem zrozumiałym
 * dla osoby edytującej arkusz.
 */
export async function fetchImage(url) {
  if (!url) return { ok: false, problem: 'Brak zdjęcia w arkuszu' };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return { ok: false, problem: `Serwer zwrócił błąd ${res.status}` };
    const bytes = Buffer.from(await res.arrayBuffer());
    const type = detectImageType(bytes);
    if (type) return { ok: true, type, bytes };
    // Google Drive zamiast pliku bez publicznego dostępu zwraca stronę logowania
    if (looksLikeHtml(bytes)) {
      return { ok: false, problem: 'Link nie prowadzi do obrazka — plik prawdopodobnie nie jest udostępniony publicznie' };
    }
    return { ok: false, problem: 'Nieobsługiwany format pliku' };
  } catch (err) {
    return { ok: false, problem: err.name === 'TimeoutError' ? 'Serwer ze zdjęciem nie odpowiada' : 'Nie udało się pobrać zdjęcia' };
  }
}
