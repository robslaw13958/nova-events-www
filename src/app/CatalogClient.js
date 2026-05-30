'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import s from './page.module.css';
import Link from 'next/link';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function parseCena(cena = '') {
  // "90zł" → { label: "90", suffix: "zł" }
  const match = cena.replace(/\s/g, '').match(/^([\d.,–\-]+)(.*)?$/);
  if (!match) return { label: cena, suffix: '' };
  return { label: match[1], suffix: match[2] || '' };
}

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

/* ─── Placeholder SVG ────────────────────────────────────────────────────── */
const ICONS = { 'krzesło': '📦', 'stół': '📦', 'ławka': '📦' };

function Placeholder({ typ }) {
  return (
    <div className={s.cardPlaceholder}>
      <span className={s.placeholderIcon}>{ICONS[typ] ?? '📦'}</span>
      <span className={s.placeholderText}>{typ}</span>
    </div>
  );
}

/* ─── Single product card ────────────────────────────────────────────────── */
function ProductCard({ product }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const { label: priceLabel } = parseCena(product.cena);
  const wariant = product.warianty[activeVariant];

  return (
    <article className={s.card}>
      {/* Image */}
      <div className={s.cardImage}>
        {wariant.zdjecie ? (
          <Image
            src={wariant.zdjecie}
            alt={product.name}
            fill
            className={s.cardImg}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <Placeholder typ={product.typ} />
        )}

        {/* Badges */}
        {wariant.outlet && (
          <span className={`${s.badge} ${s.badgeOutlet}`}>Outlet</span>
        )}
        {product.sztaplowanie > 0 && !wariant.outlet && (
          <span className={`${s.badge} ${s.badgeSztapl}`}>
            Szt. {product.sztaplowanie}×
          </span>
        )}

        {/* Hover overlay */}
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
            {/* <button className={s.btnGhost}>Szczegóły</button> */}
            <Link
              href={`/${encodeURIComponent(product.id)}`}
              className={s.btnPrimary}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Szczegóły
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={s.cardBody}>
        <div className={s.productInfo}>
          <p className={s.cardCategory}>
            {product.linia ? `${product.linia} · ${product.typ}` : product.typ}
          </p>
          <h2 className={s.cardName}>{product.name}</h2>
          {product.wymiary && <p className={s.cardSub}>{product.wymiary}</p>}

          {/* Warianty kolorystyczne */}
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
        {/* Price */}
        <div className={s.cardFooter}>
          <div className={s.priceWrapper}>
            <div className={s.price}>
              {wariant.cenaDetal}<span className={s.priceCurrency}> zł</span>
            </div>
            {wariant.cenaDetal !== wariant.cenaHurt && <p className={s.priceNote}>Cena hurtowa: {wariant.cenaHurt} zł</p>}
          </div>
          {/* <button className={s.addBtn} aria-label="Dodaj do koszyka">+</button> */}
        </div>
      </div>
    </article>
  );
}

/* ─── Main client component ──────────────────────────────────────────────── */
export default function CatalogClient({ products, filters }) {
  // ── State filtrów ──
  const [theme, setTheme] = useState('dark');
  const [search, setSearch] = useState('');
  const [activeTyp, setActiveTyp] = useState(''); // '' = wszystko
  const [activeLinia, setActiveLinia] = useState('');
  const [onlySkladane, setOnlySkladane] = useState(false);
  const [onlySztapl, setOnlySztapl] = useState(false);
  const [onlyOutlet, setOnlyOutlet] = useState(false);
  const [sortBy, setSortBy] = useState('domyślny');

  // ── Theme toggle ──
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, [theme]);

  // ── Filtrowanie + sortowanie ──
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

    if (sortBy === 'cena ↑') {
      list = [...list].sort((a, b) => a.cenaHurtNum - b.cenaHurtNum);
    } else if (sortBy === 'cena ↓') {
      list = [...list].sort((a, b) => b.cenaHurtNum - a.cenaHurtNum);
    }

    return list;
  }, [products, activeTyp, activeLinia, onlySkladane, onlySztapl, onlyOutlet, search, sortBy]);

  const SORT_OPTIONS = ['domyślny', 'cena ↑', 'cena ↓'];

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
            <nav>
              <ul className={s.navLinks}>
                <li><a href="#">Katalog</a></li>
                <li><a href="#">Zamówienia hurtowe</a></li>
                <li><a href="#">O nas</a></li>
                <li><a href="#">Kontakt</a></li>
              </ul>
            </nav>
            <button
              className={s.themeToggle}
              onClick={toggleTheme}
              aria-label="Zmień motyw"
            />
          </div>
        </div>
        <div className={s.goldLine} />
      </header>

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
        <div className={s.filterBar}>

          {/* Kategoria (Typ) — pills generowane dynamicznie */}
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

          {/* Linia — select generowany dynamicznie */}
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

          {/* Cechy boolowskie */}
          <div className={s.toggleGroup}>
            <span className={s.filterLabel}>Cechy</span>
            <div className={s.toggles}>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  checked={onlySkladane}
                  onChange={e => setOnlySkladane(e.target.checked)}
                />
                Składane
              </label>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  checked={onlySztapl}
                  onChange={e => setOnlySztapl(e.target.checked)}
                />
                Sztaplowane
              </label>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  checked={onlyOutlet}
                  onChange={e => setOnlyOutlet(e.target.checked)}
                />
                Outlet
              </label>
            </div>
          </div>

          <div className={s.filterDivider} />

          {/* Szukaj */}
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

      {/* ── CATALOG GRID ── */}
      <main className={s.catalog}>
        <div className={s.sortBar}>
          <span className={s.sortMeta}>
            Wyświetlono {visible.length} z {products.length} produktów
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
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer>
        <div className={s.goldLine} style={{ opacity: 0.2 }} />
        <div className={s.footer}>
          <span className={s.footerLogo}>Nova Events</span>
          <span className={s.footerNote}>
            © {new Date().getFullYear()} Nova Events · Sprzedaż hurtowa i detaliczna
          </span>
        </div>
      </footer>

    </div>
  );
}
