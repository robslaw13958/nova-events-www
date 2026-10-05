import { ImageResponse } from 'next/og';
import { getProducts } from '@/lib/getProducts';
import { formatPrice } from '@/lib/format';
import { OG_SIZE, OG_COLORS as C, loadOgFonts, fetchImageDataUri } from '@/lib/ogImage';

// Obrazek podglądu linku do produktu (WhatsApp, Messenger, e-mail): zdjęcie, nazwa, cena
export const alt = 'Produkt z katalogu Nova Events';
export const size = OG_SIZE;
export const contentType = 'image/png';

// Generowane przy buildzie (i odświeżane razem z danymi), jak strony produktów
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(p => ({ id: p.id }));
}

function priceInfo(warianty) {
  const detal = warianty.map(w => w.cenaDetalNum).filter(n => n > 0);
  const hurt = warianty.map(w => w.cenaHurtNum).filter(n => n > 0);
  if (!detal.length) return null;
  const minDetal = Math.min(...detal);
  const minHurt = hurt.length ? Math.min(...hurt) : minDetal;
  return {
    label: Math.max(...detal) > minDetal ? 'cena od' : 'cena',
    detal: formatPrice(minDetal),
    hurt: minHurt < minDetal ? formatPrice(minHurt) : null,
  };
}

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: 48, height: 1, background: C.gold }} />
      <div style={{ fontFamily: 'Cormorant', fontSize: 30, letterSpacing: 8, color: C.text }}>NOVA EVENTS</div>
    </div>
  );
}

export default async function Image({ params }) {
  const { id } = await params;
  const product = (await getProducts()).find(p => p.id === decodeURIComponent(id));
  const fonts = await loadOgFonts();

  if (!product) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
          <Brand />
        </div>
      ),
      { ...size, fonts }
    );
  }

  const photo = await fetchImageDataUri(product.warianty.find(w => w.zdjecie)?.zdjecie);
  const price = priceInfo(product.warianty);
  const category = [product.linia, product.typ].filter(Boolean).join(' · ');
  const kolory = new Set(product.warianty.map(w => w.kolor).filter(Boolean)).size;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, fontFamily: 'DM Sans', color: C.text }}>
        <div style={{ width: 540, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surface }}>
          {photo ? (
            <img src={photo} alt="" width={540} height={630} style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: 20, letterSpacing: 6, textTransform: 'uppercase', color: C.textDim }}>Zdjęcie wkrótce</div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {category && (
              <div style={{ fontSize: 22, letterSpacing: 5, textTransform: 'uppercase', color: C.gold }}>{category}</div>
            )}
            <div style={{ fontFamily: 'Cormorant', fontSize: product.name.length > 28 ? 60 : 74, lineHeight: 1.05, marginTop: 18 }}>
              {product.name}
            </div>
            {product.wymiary && (
              <div style={{ fontSize: 24, color: C.textDim, marginTop: 22 }}>{product.wymiary}</div>
            )}
            {kolory > 1 && (
              <div style={{ fontSize: 24, color: C.textDim, marginTop: 8 }}>{`Dostępne kolory: ${kolory}`}</div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {price && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 22, color: C.textDim }}>{price.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontFamily: 'Cormorant', fontSize: 72, color: C.gold }}>{price.detal}</div>
                  <div style={{ fontSize: 28, color: C.textDim }}>zł</div>
                </div>
                {price.hurt && (
                  <div style={{ fontSize: 22, color: C.textDim }}>{`hurtowo od ${price.hurt} zł`}</div>
                )}
              </div>
            )}
            <Brand />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
