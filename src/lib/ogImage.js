import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Wspólne elementy obrazków podglądu linków (opengraph-image.js): fonty strony i kolory.
// Generator (Satori) obsługuje tylko TTF/OTF, dlatego fonty leżą w repo jako pliki TTF.

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  bg: '#0E0E0D',
  surface: '#1A1A17',
  text: '#F0EBE1',
  textDim: 'rgba(240, 235, 225, 0.55)',
  gold: '#C8A96E',
};

const fontsDir = join(process.cwd(), 'src/assets/fonts');

export async function loadOgFonts() {
  const [serif, sans, sansMedium] = await Promise.all([
    readFile(join(fontsDir, 'CormorantGaramond-Regular.ttf')),
    readFile(join(fontsDir, 'DMSans-Regular.ttf')),
    readFile(join(fontsDir, 'DMSans-Medium.ttf')),
  ]);
  return [
    { name: 'Cormorant', data: serif, weight: 400, style: 'normal' },
    { name: 'DM Sans', data: sans, weight: 400, style: 'normal' },
    { name: 'DM Sans', data: sansMedium, weight: 500, style: 'normal' },
  ];
}

// Format rozpoznawany po pierwszych bajtach pliku, a nie po nagłówku Content-Type —
// np. mextra.pl wysyła pliki PNG oznaczone jako image/jpeg, a Satori wtedy się wywraca.
function detectImageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  return null;
}

// Zdjęcie jako data URI albo null. Niedostępne lub nieobsługiwane zdjęcie (np. plik na Drive
// bez publicznego dostępu zwraca stronę HTML) nie może przerwać generowania podglądu.
export async function fetchImageDataUri(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    const type = detectImageType(bytes);
    return type ? `data:${type};base64,${bytes.toString('base64')}` : null;
  } catch {
    return null;
  }
}
