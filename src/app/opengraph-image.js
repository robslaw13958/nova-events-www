import { ImageResponse } from 'next/og';
import { getProducts } from '@/lib/getProducts';
import { OG_SIZE, OG_COLORS as C, loadOgFonts, fetchImageDataUri } from '@/lib/ogImage';

// Obrazek podglądu linku do katalogu — to ten link najczęściej trafia do klientów
export const alt = 'Nova Events — katalog wyposażenia na wydarzenia';
export const size = OG_SIZE;
export const contentType = 'image/png';

const PHOTO_COUNT = 3;

// Zdjęcia kilku pierwszych produktów; niedostępne są pomijane
async function collagePhotos(products) {
  const urls = products.map(p => p.warianty.find(w => w.zdjecie)?.zdjecie).filter(Boolean);
  const photos = [];
  for (const url of urls) {
    const photo = await fetchImageDataUri(url);
    if (photo) photos.push(photo);
    if (photos.length === PHOTO_COUNT) break;
  }
  return photos;
}

export default async function Image() {
  const products = await getProducts();
  const [fonts, photos] = await Promise.all([loadOgFonts(), collagePhotos(products)]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, fontFamily: 'DM Sans', color: C.text }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 48, height: 1, background: C.gold }} />
            <div style={{ fontFamily: 'Cormorant', fontSize: 32, letterSpacing: 9 }}>NOVA EVENTS</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Cormorant', fontSize: 84, lineHeight: 1.05 }}>Wyposażenie</div>
            <div style={{ display: 'flex', gap: 22, fontFamily: 'Cormorant', fontSize: 84, lineHeight: 1.05 }}>
              <span>na</span>
              <span style={{ color: C.gold }}>każde wydarzenie</span>
            </div>
          </div>

          <div style={{ fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: C.textDim }}>
            {`Katalog · ${products.length} produktów · sprzedaż hurtowa i detaliczna`}
          </div>
        </div>

        {photos.length > 0 && (
          <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 6, background: C.bg }}>
            {photos.map((photo, i) => (
              <img key={i} src={photo} alt="" width={360} height={Math.floor((630 - 6 * (photos.length - 1)) / photos.length)} style={{ objectFit: 'cover' }} />
            ))}
          </div>
        )}
      </div>
    ),
    { ...size, fonts }
  );
}
