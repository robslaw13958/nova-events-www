'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import s from './page.module.css';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function dostepnoscClass(d = '') {
  const lower = d.toLowerCase();
  if (lower.includes('magazyn') || lower.includes('dostępn')) return s.dostepnoscDostepne;
  if (lower.includes('ostatni')) return s.dostepnoscOstatnie;
  return s.dostepnoscWkrotce;
}

function overlayDesc(p) {
  const parts = [];
  if (p.linia) parts.push(`Linia ${p.linia}`);
  if (p.wymiary) parts.push(p.wymiary);
  if (p.sztaplowanie) parts.push(`Sztaplowanie: ${p.sztaplowanie} szt.`);
  if (p.skladanie) parts.push('Składane');
  if (p.opis) parts.push(p.opis);
  return parts.join(' · ') || p.typ;
}

/* ─── Lightbox ───────────────────────────────────────────────────────────── */
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

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
function ProductCard({ product, onZoom }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const wariant = product.warianty[activeVariant];

  return (
    <article className={s.card}>
      <div className={s.cardImage}>
        {wariant.zdjecie ? (
          <Image
            src={wariant.zdjecie}
            alt={product.name}
            fill
            className={s.cardImg}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
          />
        ) : (
          <Placeholder typ={product.typ} />
        )}

        {wariant.outlet && (
          <span className={`${s.badge} ${s.badgeOutlet}`}>Outlet</span>
        )}

        <div className={s.cardOverlay}>
          <p className={s.overlayTitle}>{product.name}</p>
          <p className={s.overlayDesc}>{overlayDesc(product)}</p>
          {wariant.dostepnosc && (
            <p style={{ fontSize: 11, letterSpacing: '0.08em' }}>
              <span className={`${s.dostepnosc} ${dostepnoscClass(wariant.dostepnosc)}`} />
              {wariant.dostepnosc}
            </p>
          )}
          <div className={s.overlayActions}>
            {/* <button className={s.btnPrimary}>Dodaj do koszyka</button> */}
            <Link
              href={`/${encodeURIComponent(product.id)}`}
              className={s.btnPrimary}
            >
              Szczegóły
            </Link>
          </div>
        </div>
        {wariant.zdjecie && (
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
          <h2 className={s.cardName}>{product.name}</h2>
          {product.wymiary && <p className={s.cardSub}>{product.wymiary}</p>}

          {product.warianty.length > 0 && (
            <div className={s.variants}>
              {product.warianty.map((w, i) => (
                <button
                  key={i}
                  className={`${s.variant} ${i === activeVariant ? s.variantActive : ''}`}
                  style={{ background: w.hex }}
                  title={w.kolor}
                  onClick={() => setActiveVariant(i)}
                  aria-label={`Kolor: ${w.kolor}`}
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

      {/* Mobile – link szczegółów widoczny bez hovera */}
      <Link
        href={`/${encodeURIComponent(product.id)}`}
        className={s.cardMobileLink}
        aria-label={`Szczegóły: ${product.name}`}
      >
        Szczegóły →
      </Link>
    </article>
  );
}

/* ─── Main client component ──────────────────────────────────────────────── */
export default function CatalogClient({ products, filters }) {
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTyp, setActiveTyp] = useState('');
  const [activeLinia, setActiveLinia] = useState('');
  const [onlySkladane, setOnlySkladane] = useState(false);
  const [onlySztapl, setOnlySztapl] = useState(false);
  const [onlyOutlet, setOnlyOutlet] = useState(false);
  const [sortBy, setSortBy] = useState('domyślny');
  const [lightbox, setLightbox] = useState(null);

  /* Zamknij menu przy resize do desktop */
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* Zablokuj scroll body gdy menu otwarte */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, [theme]);

  const visible = useMemo(() => {
    let list = products.filter(p => {
      if (activeTyp && p.typ !== activeTyp) return false;
      if (activeLinia && p.linia !== activeLinia) return false;
      if (onlySkladane && !p.skladanie) return false;
      if (onlySztapl && p.sztaplowanie === 0) return false;
      if (onlyOutlet && !p.outlet) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
          !p.typ.toLowerCase().includes(q) &&
          !p.linia.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'cena ↑') list = [...list].sort((a, b) => a.cenaHurtNum - b.cenaHurtNum);
    if (sortBy === 'cena ↓') list = [...list].sort((a, b) => b.cenaHurtNum - a.cenaHurtNum);
    return list;
  }, [products, activeTyp, activeLinia, onlySkladane, onlySztapl, onlyOutlet, search, sortBy]);

  const activeFiltersCount = [activeTyp, activeLinia, onlySkladane, onlySztapl, onlyOutlet, search]
    .filter(Boolean).length;

  const SORT_OPTIONS = ['domyślny', 'cena ↑', 'cena ↓'];
  const NAV_LINKS = ['Katalog', 'Zamówienia hurtowe', 'O nas', 'Kontakt'];

  return (
    <div className={s.wrapper}>

      {/* ── HEADER ── */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.logo}>
            <span className={s.logoName}>Nova Events</span>
            <span className={s.logoTag}>Wyposażenie Cateringowe</span>
          </div>

          <div className={s.headerRight}>
            {/* Desktop nav */}
            <nav className={s.desktopNav}>
              <ul className={s.navLinks}>
                {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </nav>

            <button
              className={s.themeToggle}
              onClick={toggleTheme}
              aria-label="Zmień motyw"
            />

            {/* Hamburger */}
            <button
              className={`${s.hamburger} ${menuOpen ? s.hamburgerOpen : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <div className={s.goldLine} />
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div
        className={`${s.mobileMenuOverlay} ${menuOpen ? s.mobileMenuOverlayOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── MOBILE MENU DRAWER ── */}
      <nav className={`${s.mobileMenu} ${menuOpen ? s.mobileMenuOpen : ''}`} aria-label="Nawigacja mobilna">
        <div className={s.mobileMenuHeader}>
          <span className={s.mobileMenuLogo}>Nova Events</span>
          <button
            className={s.mobileMenuClose}
            onClick={() => setMenuOpen(false)}
            aria-label="Zamknij menu"
          >
            ✕
          </button>
        </div>
        <ul className={s.mobileNavLinks}>
          {NAV_LINKS.map(l => (
            <li key={l}>
              <a href="#" onClick={() => setMenuOpen(false)}>{l}</a>
            </li>
          ))}
        </ul>
        <div className={s.mobileMenuFooter}>
          <button className={s.mobileThemeBtn} onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Jasny motyw' : '☾ Ciemny motyw'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
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

      {/* ── FILTERS ── */}
      <div className={s.filterSection}>

        {/* Mobile filter toggle */}
        <button
          className={s.filterToggleBtn}
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
        >
          <span>Filtry i wyszukiwanie</span>
          {activeFiltersCount > 0 && (
            <span className={s.filterBadge}>{activeFiltersCount}</span>
          )}
          <span className={`${s.filterToggleArrow} ${filtersOpen ? s.filterToggleArrowOpen : ''}`}>
            ▾
          </span>
        </button>

        <div className={`${s.filterBar} ${filtersOpen ? s.filterBarOpen : ''}`}>

          <div className={s.categoryGroup}>
            <span className={s.filterLabel}>Kategoria</span>
            <div className={s.pills}>
              <button
                className={`${s.pill} ${activeTyp === '' ? s.active : ''}`}
                onClick={() => setActiveTyp('')}
              >
                Wszystko
              </button>
              {filters.typy.map(typ => (
                <button
                  key={typ}
                  className={`${s.pill} ${activeTyp === typ ? s.active : ''}`}
                  onClick={() => setActiveTyp(activeTyp === typ ? '' : typ)}
                >
                  {typ.charAt(0).toUpperCase() + typ.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={s.filterDivider} />

          <div className={s.filterGroup}>
            <label className={s.filterLabel} htmlFor="sel-linia">Linia</label>
            <select
              id="sel-linia"
              className={s.filterSelect}
              value={activeLinia}
              onChange={e => setActiveLinia(e.target.value)}
            >
              <option value="">Wszystkie</option>
              {filters.linie.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className={s.filterDivider} />

          <div className={s.toggleGroup}>
            <span className={s.filterLabel}>Cechy</span>
            <div className={s.toggles}>
              <label className={s.toggleLabel}>
                <input type="checkbox" checked={onlySkladane} onChange={e => setOnlySkladane(e.target.checked)} />
                Składane
              </label>
              <label className={s.toggleLabel}>
                <input type="checkbox" checked={onlySztapl} onChange={e => setOnlySztapl(e.target.checked)} />
                Sztaplowane
              </label>
              <label className={s.toggleLabel}>
                <input type="checkbox" checked={onlyOutlet} onChange={e => setOnlyOutlet(e.target.checked)} />
                Outlet
              </label>
            </div>
          </div>

          <div className={s.filterDivider} />

          <div className={s.searchGroup}>
            <label className={s.filterLabel} htmlFor="search">Szukaj</label>
            <input
              id="search"
              className={s.searchInput}
              type="search"
              placeholder="Szukaj produktu…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* ── CATALOG ── */}
      <main className={s.catalog}>
        <div className={s.sortBar}>
          <span className={s.sortMeta}>
            {visible.length} z {products.length} produktów
          </span>
          <div className={s.sortOptions}>
            <span className={s.sortLabel}>Sortuj:</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`${s.sortBtn} ${sortBy === opt ? s.sortBtnActive : ''}`}
                onClick={() => setSortBy(opt)}
              >
                {opt}
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
            </div>
          ) : (
            visible.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onZoom={(src, alt) => setLightbox({ src, alt })}
              />
            ))
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer>
  <div className={s.goldLine} style={{ opacity: 0.2 }} />
  <div className={s.footerInner}>

    <div className={s.footerBrand}>
      <span className={s.footerLogo}>Nova Events</span>
      <p className={s.footerTagline}>
        Wyposażenie cateringowe na wynajem i sprzedaż hurtową.<br />
        Obsługujemy eventy, wesela, konferencje i gastronomię.
      </p>
    </div>

    <div className={s.footerContact}>
      <p className={s.footerContactLabel}>Kontakt</p>
      <a href="tel:+48123456789" className={s.footerPhone}>+48 123 456 789</a>
      <a href="mailto:kontakt@novaevents.pl" className={s.footerMail}>
        kontakt@novaevents.pl
      </a>
      <p className={s.footerHours}>Pn–Pt, 8:00–17:00</p>
    </div>

    <div className={s.footerContact}>
      <p className={s.footerContactLabel}>Nawigacja</p>
      <nav>
        <ul className={s.footerNav}>
          {['Katalog', 'Zamówienia hurtowe', 'O nas', 'Kontakt'].map(l => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>
      </nav>
    </div>

  </div>
  <div className={s.footerBottom}>
    <span>© {new Date().getFullYear()} Nova Events · Sprzedaż hurtowa i detaliczna</span>
  </div>
</footer>
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}