'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lightbox, ZoomIcon } from '@/components/Lightbox';
import { dostepnoscStatus } from '@/lib/dostepnosc';
import s from './product.module.css';

const DOSTEPNOSC_DOT = {
  dostepne: s.dotDostepne,
  ostatnie: s.dotOstatnie,
  wkrotce:  s.dotWkrotce,
};
function dostepnoscDot(d) {
  return DOSTEPNOSC_DOT[dostepnoscStatus(d)];
}

export default function VariantGrid({ warianty, productName, onAddToCart }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <div className={s.variantGrid}>
        {warianty.map((w, i) => (
          <div key={i} className={s.variantCard}>
            {w.zdjecie && (
              <div className={s.variantImage}>
                <Image
                  src={w.zdjecie}
                  alt={`${productName} – ${w.kolor}`}
                  fill
                  className={s.variantImg}
                  sizes="280px"
                />
                <button
                  className={s.zoomBtn}
                  onClick={() => setLightbox({ src: w.zdjecie, alt: `${productName} – ${w.kolor}` })}
                  aria-label="Powiększ zdjęcie"
                >
                  <ZoomIcon />
                </button>
              </div>
            )}

            <div className={s.variantBody}>
              <div className={s.variantHeader}>
                <span className={s.variantColorDot} style={{ background: w.hex }} />
                <span className={s.variantKolor}>{w.kolor || '—'}</span>
                {w.outlet && <span className={s.variantOutlet}>Outlet</span>}
              </div>
              <div className={s.variantRows}>
                <div className={s.variantRow}>
                  <span className={s.variantRowLabel}>Cena detal</span>
                  <span className={s.variantRowValue}>{w.cenaDetal || '—'} zł</span>
                </div>
                <div className={s.variantRow}>
                  <span className={s.variantRowLabel}>Cena hurt</span>
                  <span className={s.variantRowValue}>{w.cenaHurt || '—'} zł</span>
                </div>
                {w.dostepnosc && (
                  <div className={s.variantRow}>
                    <span className={s.variantRowLabel}>Dostępność</span>
                    <span className={`${s.variantRowValue} ${s.variantDostepnosc}`}>
                      <span className={`${s.dot} ${dostepnoscDot(w.dostepnosc)}`} />
                      {w.dostepnosc}
                    </span>
                  </div>
                )}
              </div>
              {onAddToCart && (
                <button
                  className={s.variantAddBtn}
                  onClick={() => onAddToCart(i)}
                >
                  + Dodaj do koszyka
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} styles={s} />
      )}
    </>
  );
}