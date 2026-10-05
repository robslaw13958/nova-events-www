import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchImage } from './imageCheck';

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

const OG_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

// Zdjęcie jako data URI albo null — generator obsługuje tylko JPEG i PNG, a niedostępne
// zdjęcie (np. plik na Drive bez publicznego dostępu) nie może przerwać generowania podglądu.
export async function fetchImageDataUri(url) {
  const image = await fetchImage(url);
  if (!image.ok || !OG_IMAGE_TYPES.has(image.type)) return null;
  return `data:${image.type};base64,${image.bytes.toString('base64')}`;
}
