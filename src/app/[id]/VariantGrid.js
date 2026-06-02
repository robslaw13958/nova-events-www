'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import s from './product.module.css';

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={s.lightbox} onClick={onClose}>
      <button className={s.lightboxClose} onClick={onClose} aria-label="Zamknij">✕</button>
      <div className={s.lightboxImgWrap} onClick={e => e.stopPropagation()}>
        <Image src={src} alt={alt || ''} fill className={s.lightboxImg} sizes="100vw" />
      </div>
    </div>
  );
}

const ZoomIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

function dostepnoscDot(d = '') {
  const lower = d.toLowerCase();
  if (lower.includes('magazyn') || lower.includes('dostępn')) return s.dotDostepne;
  if (lower.includes('ostatni')) return s.dotOstatnie;
  return s.dotWkrotce;
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
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}