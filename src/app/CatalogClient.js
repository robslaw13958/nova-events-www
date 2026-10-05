'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCartModal } from '@/components/Cart';
import { Lightbox, ZoomIcon } from '@/components/Lightbox';
import { useImageError } from '@/components/ProductImage';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { dostepnoscStatus } from '@/lib/dostepnosc';
import { productMatchesFilter, matchesSearch } from '@/lib/autoFilters';
import { SORT_OPTIONS, DEFAULT_SORT, buildCatalogQuery, rememberCatalogQuery } from '@/lib/catalogParams';
import { copyToClipboard } from '@/lib/clipboard';
import s from './page.module.css';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const DOSTEPNOSC_CLASS = {
  dostepne: s.dostepnoscDostepne,
  ostatnie: s.dostepnoscOstatnie,
  wkrotce:  s.dostepnoscWkrotce,
  niedostepne: s.dostepnoscNiedostepne,
};
function dostepnoscClass(d) {
  return DOSTEPNOSC_CLASS[dostepnoscStatus(d)];
}

// Krótkie fakty o produkcie — pełny opis jest na stronie produktu
function overlayFacts(p) {
  const parts = [];
  if (p.linia) parts.push(`Linia ${p.linia}`);
  if (p.wymiary) parts.push(p.wymiary);
  if (p.sztaplowanie) parts.push(`Sztaplowanie: ${p.sztaplowanie} szt.`);
  if (p.skladanie) parts.push('Składane');
  return parts.join(' · ');
}


/* ─── Placeholder ────────────────────────────────────────────────────────── */
function Placeholder({ typ }) {
  return (
    <div className={s.cardPlaceholder}>
      <span className={s.placeholderIcon}>📦</span>
      <span className={s.placeholderText}>{typ}</span>
    </div>
  );
}

/* ─── Single product card ────────────────────────────────────────────────── */
function ProductCard({ product, onAddToCart, onZoom }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const wariant = product.warianty[activeVariant];
  const href = `/${encodeURIComponent(product.id)}`;
  const facts = overlayFacts(product);
  const showSwatches = product.warianty.length > 1 || !!wariant.kolor;
  const [imageFailed, onImageError] = useImageError(wariant.zdjecie);

  return (
    <article className={s.card}>
      <div className={s.cardImage}>
        <Link href={href} className={s.cardImageLink} tabIndex={-1} aria-hidden="true">
          {!imageFailed ? (
            <Image
              src={wariant.zdjecie}
              alt=""
              fill
              className={s.cardImg}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              onError={onImageError}
            />
          ) : (
            <Placeholder typ={product.typ} />
          )}
        </Link>

        {wariant.outlet && (
          <span className={`${s.badge} ${s.badgeOutlet}`}>Outlet</span>
        )}

        <div className={s.cardOverlay}>
          <p className={s.overlayTitle}>{product.name}</p>
          {facts && <p className={s.overlayFacts}>{facts}</p>}
          {wariant.dostepnosc && (
            <p className={s.overlayDostepnosc}>
              <span className={`${s.dostepnosc} ${dostepnoscClass(wariant.dostepnosc)}`} />
              {wariant.dostepnosc}
            </p>
          )}
          <div className={s.overlayActions}>
            <button
              className={s.btnPrimary}
              onClick={() => onAddToCart(product, activeVariant)}
            >
              Dodaj do koszyka
            </button>
            <Link href={href} className={s.btnGhost}>
              Szczegóły
            </Link>
          </div>
        </div>
        {!imageFailed && (
          <button
            className={s.zoomBtn}
            onClick={e => { e.preventDefault(); e.stopPropagation(); onZoom(wariant.zdjecie, product.name); }}
            aria-label="Powiększ zdjęcie"
          >
            <ZoomIcon />
          </button>
        )}
      </div>

      <div className={s.cardBody}>
        <div className={s.productInfo}>
          <p className={s.cardCategory}>
            {product.linia ? `${product.linia} · ${product.typ}` : product.typ}
          </p>
          <h2 className={s.cardName}>
            <Link href={href} className={s.cardNameLink}>{product.name}</Link>
          </h2>
          {product.wymiary && <p className={s.cardSub}>{product.wymiary}</p>}

          {showSwatches && (
            <div className={s.variants}>
              {product.warianty.map((w, i) => (
                <button
                  key={i}
                  className={`${s.variant} ${i === activeVariant ? s.variantActive : ''}`}
                  style={{ background: w.hex }}
                  title={w.kolor || 'Standard'}
                  onClick={() => setActiveVariant(i)}
                  aria-label={`Kolor: ${w.kolor || 'Standard'}`}
                  aria-pressed={i === activeVariant}
                />
              ))}
            </div>
          )}
        </div>

        <div className={s.cardFooter}>
          <div className={s.priceWrapper}>
            <div className={s.price}>
              {wariant.cenaDetal}<span className={s.priceCurrency}> zł</span>
            </div>
            {wariant.cenaDetal !== wariant.cenaHurt &&
              <p className={s.priceNote}>Hurt: {wariant.cenaHurt} zł</p>
            }
          </div>
        </div>
      </div>

      {/* Mobile – przyciski widoczne bez hovera */}
      <div className={s.cardMobileActions}>
        <button
          className={s.cardMobileCart}
          onClick={() => onAddToCart(product, activeVariant)}
        >
          + Dodaj
        </button>
        <Link href={href} className={s.cardMobileLink}>
          Szczegóły →
        </Link>
      </div>
    </article>
  );
}

/* ─── Main client component ──────────────────────────────────────────────── */
// `initialState` przychodzi z adresu strony (CatalogFromUrl). Bez niego (statyczny
// fallback renderowany na serwerze) komponent nie dotyka adresu.
export default function CatalogClient({ products, filters, initialState }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState(initialState?.search ?? '');
  const [selected, setSelected] = useState(initialState?.selected ?? {}); // { [field]: string[] | true }
  const [sortBy, setSortBy] = useState(initialState?.sortBy ?? DEFAULT_SORT);
  const [linkCopied, setLinkCopied] = useState(false);
  const linkCopiedTimer = useRef(null);
  const syncUrl = !!initialState;
  const [modal, setModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const openModal = useCallback((product, wariantIndex) => setModal({ product, wariantIndex }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const toggleSelectValue = useCallback((field, value) => {
    setSelected(prev => {
      const current = prev[field] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  }, []);

  const toggleBoolean = useCallback((field) => {
    setSelected(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const clearFilters = useCallback(() => {
    setSelected({});
    setSearch('');
  }, []);

  const minCenaHurt = (p) => Math.min(...p.warianty.map(w => w.cenaHurtNum));

  const isBooleanActive = (field) => !!selected[field];

  const query = useMemo(
    () => buildCatalogQuery({ selected, search, sortBy }, filters),
    [selected, search, sortBy, filters]
  );

  // replaceState zamiast pushState: „wstecz” nie przechodzi przez każde kliknięcie filtra
  useEffect(() => {
    if (!syncUrl) return;
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', url);
    rememberCatalogQuery(query);
  }, [query, syncUrl]);

  useEffect(() => () => clearTimeout(linkCopiedTimer.current), []);

  const copyLink = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (!ok) return;
    setLinkCopied(true);
    clearTimeout(linkCopiedTimer.current);
    linkCopiedTimer.current = setTimeout(() => setLinkCopied(false), 2500);
  };

  const visible = useMemo(() => {
    let list = products.filter(p => {
      if (!matchesSearch(p, search)) return false;

      for (const f of filters) {
        const sel = selected[f.field];
        if (f.type === 'boolean') {
          if (sel && !productMatchesFilter(p, f.field, 'boolean')) return false;
        } else if (Array.isArray(sel) && sel.length > 0) {
          if (!productMatchesFilter(p, f.field, 'select', sel)) return false;
        }
      }
      return true;
    });

    if (sortBy === 'cena ↑') list = [...list].sort((a, b) => minCenaHurt(a) - minCenaHurt(b));
    if (sortBy === 'cena ↓') list = [...list].sort((a, b) => minCenaHurt(b) - minCenaHurt(a));
    return list;
  }, [products, filters, selected, search, sortBy]);

  const activeFiltersCount = Object.values(selected).reduce((count, val) => {
    if (Array.isArray(val)) return count + (val.length > 0 ? 1 : 0);
    return count + (val ? 1 : 0);
  }, search ? 1 : 0);

  const selectFilters = filters.filter(f => f.type === 'select');
  const booleanFilters = filters.filter(f => f.type === 'boolean');

  return (
    <div className={s.wrapper}>

      <SiteHeader />

      <div className={s.heroStrip}>
        <h1 className={s.heroTitle}>
          Wyposażenie<br />na <em>każde wydarzenie</em>
        </h1>
        <div className={s.heroMeta}>
          <p className={s.heroCount}>
            <span>{visible.length}</span>
            {visible.length === products.length
              ? 'produktów w katalogu'
              : `z ${products.length} produktów`}
          </p>
        </div>
      </div>

      <div className={s.catalogLayout}>
        <aside className={s.filterSection} aria-label="Filtry">
          <button
            className={s.filterToggleBtn}
            onClick={() => setFiltersOpen(o => !o)}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
          >
            <span>Filtry i wyszukiwanie</span>
            {activeFiltersCount > 0 && (
              <span className={s.filterBadge}>{activeFiltersCount}</span>
            )}
            <span className={`${s.filterToggleArrow} ${filtersOpen ? s.filterToggleArrowOpen : ''}`}>▾</span>
          </button>

          <div id="filter-panel" className={`${s.filterPanel} ${filtersOpen ? s.filterPanelOpen : ''}`}>
            <div className={s.filterPanelHeader}>
              <span className={s.filterPanelTitle}>Filtry</span>
              <button
                className={s.filterClearBtn}
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
                tabIndex={activeFiltersCount === 0 ? -1 : 0}
              >
                Wyczyść
              </button>
            </div>

            <div className={s.filterGroup}>
              <label className={s.filterLabel} htmlFor="search">Szukaj</label>
              <input
                id="search"
                className={s.searchInput}
                type="search"
                placeholder="Nazwa, kolor, linia…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {selectFilters.map(f => (
              <div key={f.field} className={s.filterGroup}>
                <span className={s.filterLabel}>{f.label}</span>
                <div className={s.pills}>
                  {f.values.map(value => {
                    const active = (selected[f.field] || []).includes(value);
                    return (
                      <button
                        key={value}
                        className={`${s.pill} ${active ? s.active : ''}`}
                        onClick={() => toggleSelectValue(f.field, value)}
                        aria-pressed={active}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {booleanFilters.length > 0 && (
              <div className={s.filterGroup}>
                <span className={s.filterLabel}>Cechy</span>
                <div className={s.pills}>
                  {booleanFilters.map(f => (
                    <button
                      key={f.field}
                      className={`${s.pill} ${isBooleanActive(f.field) ? s.active : ''}`}
                      onClick={() => toggleBoolean(f.field)}
                      aria-pressed={isBooleanActive(f.field)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className={s.catalog}>
          <div className={s.sortBar}>
            <span className={s.sortMeta}>
              {visible.length} z {products.length} produktów
              {activeFiltersCount > 0 && (
                <button className={s.copyLinkBtn} onClick={copyLink}>
                  {linkCopied ? 'Link skopiowany ✓' : 'Kopiuj link do zestawienia'}
                </button>
              )}
            </span>
            <div className={s.sortOptions}>
              <span className={s.sortLabel}>Sortuj:</span>
              {SORT_OPTIONS.map(({ label }) => (
                <button
                  key={label}
                  className={`${s.sortBtn} ${sortBy === label ? s.sortBtnActive : ''}`}
                  onClick={() => setSortBy(label)}
                  aria-pressed={sortBy === label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.grid}>
            {visible.length === 0 ? (
              <div className={s.empty}>
                <p className={s.emptyIcon}>🔍</p>
                <p className={s.emptyText}>Brak produktów</p>
                <p className={s.emptySub}>Zmień kryteria filtrowania</p>
                {activeFiltersCount > 0 && (
                  <button className={s.filterClearBtn} onClick={clearFilters}>Wyczyść filtry</button>
                )}
              </div>
            ) : (
              visible.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={openModal} onZoom={(src, alt) => setLightbox({ src, alt })}/>
              ))
            )}
          </div>
        </main>
      </div>

      <SiteFooter />

      {modal && (
        <AddToCartModal
          product={modal.product}
          wariantIndex={modal.wariantIndex}
          onClose={closeModal}
        />
      )}

      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} styles={s} />
      )}

    </div>
  );
}