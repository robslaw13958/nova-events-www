'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Lightbox, ZoomIcon } from '@/components/Lightbox';
import { useCart, HURT_PROG } from '@/lib/cartStore';
import { formatPrice } from '@/lib/format';
import { isOpisNote, opisExcerpt } from '@/lib/opis';
import ProductDescription from './ProductDescription';
import VariantTable, { DostepnoscDot } from './VariantTable';
import s from './product.module.css';

function categoryLabel(p) {
  return p.linia && p.typ ? `${p.linia} · ${p.typ}` : p.linia || p.typ;
}

function sztaplowanieLabel(n) {
  return n > 0 ? `do ${n} szt.` : 'Nie';
}

// Unikalne zdjęcia produktu; każde wskazuje pierwszy wariant, który go używa
function collectPhotos(warianty) {
  const photos = [];
  warianty.forEach((w, i) => {
    if (w.zdjecie && !photos.some(p => p.src === w.zdjecie)) {
      photos.push({ src: w.zdjecie, wariantIndex: i, kolor: w.kolor });
    }
  });
  return photos;
}

function buildParams(p) {
  const kolory = [...new Set(p.warianty.map(w => w.kolor).filter(Boolean))];
  return [
    ['Linia', p.linia],
    ['Typ', p.typ],
    ['Wymiary', p.wymiary],
    ['Kolory', kolory.join(', ')],
    ['Sztaplowanie', sztaplowanieLabel(p.sztaplowanie)],
    ['Składane', p.skladanie ? 'Tak' : 'Nie'],
    ['Zestaw', p.zestaw ? 'Tak' : null],
  ].filter(([, value]) => value);
}

/* ─── Galeria ────────────────────────────────────────────────────────────── */
function Gallery({ product, mainSrc, photos, onSelectVariant, onZoom }) {
  return (
    <div className={s.gallery}>
      <div className={s.galleryMain}>
        {mainSrc ? (
          <>
            <Image
              key={mainSrc}
              src={mainSrc}
              alt={product.name}
              fill
              className={s.galleryImg}
              sizes="(max-width: 900px) 100vw, 680px"
              loading="eager"
              fetchPriority="high"
            />
            <button className={s.zoomBtn} onClick={() => onZoom(mainSrc)} aria-label="Powiększ zdjęcie">
              <ZoomIcon />
            </button>
          </>
        ) : (
          <div className={s.galleryPlaceholder}>
            <span className={s.placeholderIcon}>📦</span>
            <span className={s.placeholderText}>Zdjęcie wkrótce</span>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className={s.thumbs}>
          {photos.map(photo => (
            <button
              key={photo.src}
              className={`${s.thumb} ${photo.src === mainSrc ? s.thumbActive : ''}`}
              onClick={() => onSelectVariant(photo.wariantIndex)}
              aria-label={`Pokaż wariant: ${photo.kolor || 'Standard'}`}
            >
              <Image src={photo.src} alt="" fill className={s.thumbImg} sizes="88px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Panel zakupu ───────────────────────────────────────────────────────── */
function BuyBox({ product, activeIndex, onSelectVariant, lead }) {
  const [ilosc, setIlosc] = useState(1);
  const addItem = useCart(state => state.addItem);
  const wariant = product.warianty[activeIndex];

  const isHurt = ilosc >= HURT_PROG;
  const hasHurtPrice = wariant.cenaHurtNum > 0 && wariant.cenaHurtNum !== wariant.cenaDetalNum;
  const cena = isHurt ? wariant.cenaHurtNum : wariant.cenaDetalNum;
  const note = isOpisNote(wariant.opis) ? wariant.opis : '';
  const setQty = val => setIlosc(Math.max(1, Math.round(parseInt(val, 10) || 1)));

  const chips = [
    product.wymiary,
    product.sztaplowanie > 0 && `Sztaplowanie do ${product.sztaplowanie} szt.`,
    product.skladanie && 'Składane',
    product.zestaw && 'Zestaw',
  ].filter(Boolean);

  return (
    <div className={s.buyBox}>
      {categoryLabel(product) && <p className={s.category}>{categoryLabel(product)}</p>}
      <h1 className={s.title}>{product.name}</h1>

      {chips.length > 0 && (
        <ul className={s.chips}>
          {chips.map(chip => <li key={chip} className={s.chip}>{chip}</li>)}
        </ul>
      )}

      {lead && (
        <p className={s.lead}>
          {lead} <a href="#opis" className={s.leadLink}>Pełny opis ↓</a>
        </p>
      )}

      {product.warianty.length > 1 && (
        <div className={s.buySection}>
          <p className={s.buyLabel}>
            Wariant: <span className={s.buyLabelValue}>{wariant.kolor || 'Standard'}{wariant.outlet && ' · Outlet'}</span>
          </p>
          <div className={s.colorOptions}>
            {product.warianty.map((w, i) => (
              <button
                key={i}
                className={`${s.colorOption} ${i === activeIndex ? s.colorOptionActive : ''}`}
                onClick={() => onSelectVariant(i)}
                aria-pressed={i === activeIndex}
              >
                <span className={s.swatchDot} style={{ background: w.hex }} />
                {w.kolor || 'Standard'}
                {w.outlet && <span className={s.outletTag}>Outlet</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={s.priceBox}>
        <div className={`${s.priceTier} ${!isHurt ? s.priceTierActive : ''}`}>
          <span className={s.priceTierLabel}>
            Cena detaliczna{hasHurtPrice && <span className={s.priceTierMeta}> poniżej {HURT_PROG} szt.</span>}
          </span>
          <span className={s.priceMain}>{wariant.cenaDetal || '—'} <small>zł</small></span>
        </div>
        {hasHurtPrice && (
          <div className={`${s.priceTier} ${isHurt ? s.priceTierActive : ''}`}>
            <span className={s.priceTierLabel}>
              Cena hurtowa<span className={s.priceTierMeta}> od {HURT_PROG} szt.</span>
            </span>
            <span className={s.priceSecondary}>{wariant.cenaHurt} <small>zł</small></span>
          </div>
        )}
      </div>

      {(wariant.dostepnosc || wariant.outlet) && (
        <div className={s.statusRow}>
          {wariant.dostepnosc && (
            <span className={s.dostepnosc}>
              <DostepnoscDot value={wariant.dostepnosc} />
              {wariant.dostepnosc}
            </span>
          )}
          {wariant.outlet && (
            <span className={s.outletNote}>
              <span className={s.outletTag}>Outlet</span>
              {note || 'Produkt z outletu w obniżonej cenie'}
            </span>
          )}
        </div>
      )}

      <div className={s.buyRow}>
        <div className={s.qty}>
          <button className={s.qtyBtn} onClick={() => setQty(ilosc - 1)} aria-label="Zmniejsz ilość">−</button>
          <input
            className={s.qtyInput}
            type="number"
            min="1"
            value={ilosc}
            onChange={e => setQty(e.target.value)}
            aria-label="Ilość"
          />
          <button className={s.qtyBtn} onClick={() => setQty(ilosc + 1)} aria-label="Zwiększ ilość">+</button>
        </div>
        <button className={s.addBtn} onClick={() => addItem(product, activeIndex, ilosc)}>
          Dodaj do koszyka
        </button>
      </div>

      <p className={s.sumLine}>
        {ilosc} × {formatPrice(cena)} zł = <strong>{formatPrice(cena * ilosc)} zł</strong>
        {hasHurtPrice && !isHurt && (
          <span className={s.sumHint}> · cena hurtowa od {HURT_PROG} szt.</span>
        )}
      </p>

      <p className={s.helpLine}>
        Większe zamówienie lub pytania? <Link href="/zamowienia-hurtowe">Zamówienia hurtowe</Link>
        {' · '}<Link href="/kontakt">Kontakt</Link>
      </p>
    </div>
  );
}

/* ─── Podobne produkty ───────────────────────────────────────────────────── */
function RelatedCard({ item }) {
  return (
    <Link href={`/${encodeURIComponent(item.id)}`} className={s.relatedCard}>
      <div className={s.relatedImage}>
        {item.zdjecie ? (
          <Image src={item.zdjecie} alt="" fill className={s.relatedImg} sizes="(max-width: 640px) 50vw, 300px" />
        ) : (
          <span className={s.placeholderIcon}>📦</span>
        )}
      </div>
      <div className={s.relatedBody}>
        {categoryLabel(item) && <p className={s.relatedCategory}>{categoryLabel(item)}</p>}
        <p className={s.relatedName}>{item.name}</p>
        {item.wymiary && <p className={s.relatedSub}>{item.wymiary}</p>}
        <p className={s.relatedPrice}>od {formatPrice(item.cenaOd)} zł</p>
      </div>
    </Link>
  );
}

/* ─── Strona ─────────────────────────────────────────────────────────────── */
export default function ProductPageClient({ product, related = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const buyRef = useRef(null);

  const wariant = product.warianty[activeIndex];
  const photos = useMemo(() => collectPhotos(product.warianty), [product.warianty]);
  const params = useMemo(() => buildParams(product), [product]);

  // Opis podąża za wybranym wariantem (kolor w tytule); krótka notatka outletu nie zastępuje opisu
  const opis = wariant.opis && !isOpisNote(wariant.opis) ? wariant.opis : product.opis;
  const lead = useMemo(() => opisExcerpt(opis, 180), [opis]);
  const mainSrc = wariant.zdjecie || photos[0]?.src || '';

  const selectFromTable = (i) => {
    setActiveIndex(i);
    buyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={s.wrapper}>
      <SiteHeader />

      <main className={s.main}>
        <nav className={s.breadcrumb} aria-label="Ścieżka">
          <Link href="/">Katalog</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className={s.top} ref={buyRef}>
          <Gallery
            product={product}
            mainSrc={mainSrc}
            photos={photos}
            onSelectVariant={setActiveIndex}
            onZoom={src => setLightbox({ src, alt: product.name })}
          />
          <BuyBox
            product={product}
            activeIndex={activeIndex}
            onSelectVariant={setActiveIndex}
            lead={lead}
          />
        </div>

        <div className={s.infoGrid}>
          {opis ? (
            <section id="opis" className={s.section}>
              <h2 className={s.sectionTitle}>Opis</h2>
              <ProductDescription text={opis} />
            </section>
          ) : null}

          <aside className={`${s.section} ${opis ? '' : s.sectionWide}`}>
            <h2 className={s.sectionTitle}>Parametry</h2>
            <dl className={s.params}>
              {params.map(([label, value]) => (
                <div key={label} className={s.paramRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {product.warianty.length > 1 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>
              Warianty<span className={s.sectionCount}>{product.warianty.length}</span>
            </h2>
            <VariantTable warianty={product.warianty} activeIndex={activeIndex} onSelect={selectFromTable} />
          </section>
        )}

        {related.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Podobne produkty</h2>
            <div className={s.relatedGrid}>
              {related.map(item => <RelatedCard key={item.id} item={item} />)}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />

      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} styles={s} />
      )}
    </div>
  );
}
