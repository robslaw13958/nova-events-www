'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartIcon, AddToCartModal, CartDrawer } from '@/components/Cart';
import { Lightbox, ZoomIcon } from '@/components/Lightbox';
import { useTheme } from '@/lib/themeStore';
import { dostepnoscStatus } from '@/lib/dostepnosc';
import { productMatchesFilter, matchesSearch } from '@/lib/autoFilters';
import s from './page.module.css';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const DOSTEPNOSC_CLASS = {
  dostepne: s.dostepnoscDostepne,
  ostatnie: s.dostepnoscOstatnie,
  wkrotce:  s.dostepnoscWkrotce,
};
function dostepnoscClass(d) {
  return DOSTEPNOSC_CLASS[dostepnoscStatus(d)];
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
            <button
              className={s.btnPrimary}
              onClick={() => onAddToCart(product, activeVariant)}
            >
              Dodaj do koszyka
            </button>
            <Link
              href={`/${encodeURIComponent(product.id)}`}
              className={s.btnGhost}
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

      {/* Mobile – przyciski widoczne bez hovera */}
      <div className={s.cardMobileActions}>
        <button
          className={s.cardMobileCart}
          onClick={() => onAddToCart(product, activeVariant)}
        >
          + Dodaj
        </button>
        <Link
          href={`/${encodeURIComponent(product.id)}`}
          className={s.cardMobileLink}
        >
          Szczegóły →
        </Link>
      </div>
    </article>
  );
}

/* ─── Main client component ──────────────────────────────────────────────── */
export default function CatalogClient({ products, filters }) {
  const { theme, initTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({}); // { [field]: string[] | true }
  const [sortBy, setSortBy] = useState('domyślny');
  const [modal, setModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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

  const SORT_OPTIONS = ['domyślny', 'cena ↑', 'cena ↓'];
  const NAV_LINKS = ['Katalog', 'Zamówienia hurtowe', 'O nas', 'Kontakt'];

  return (
    <div className={s.wrapper}>

      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.logo}>
            <span className={s.logoName}>Nova Events</span>
            <span className={s.logoTag}>Wyposażenie Cateringowe</span>
          </div>
          <div className={s.headerRight}>
            <nav className={s.desktopNav}>
              <ul className={s.navLinks}>
                {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </nav>
            <CartIcon />
            <button className={s.themeToggle} onClick={toggleTheme} aria-label="Zmień motyw" />
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

      <div
        className={`${s.mobileMenuOverlay} ${menuOpen ? s.mobileMenuOverlayOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav className={`${s.mobileMenu} ${menuOpen ? s.mobileMenuOpen : ''}`}>
        <div className={s.mobileMenuHeader}>
          <span className={s.mobileMenuLogo}>Nova Events</span>
          <button className={s.mobileMenuClose} onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <ul className={s.mobileNavLinks}>
          {NAV_LINKS.map(l => (
            <li key={l}><a href="#" onClick={() => setMenuOpen(false)}>{l}</a></li>
          ))}
        </ul>
        <div className={s.mobileMenuFooter}>
          <button className={s.mobileThemeBtn} onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Jasny motyw' : '☾ Ciemny motyw'}
          </button>
        </div>
      </nav>

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

      <div className={s.filterSection}>
        <button
          className={s.filterToggleBtn}
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
        >
          <span>Filtry i wyszukiwanie</span>
          {activeFiltersCount > 0 && (
            <span className={s.filterBadge}>{activeFiltersCount}</span>
          )}
          <span className={`${s.filterToggleArrow} ${filtersOpen ? s.filterToggleArrowOpen : ''}`}>▾</span>
        </button>

        <div className={`${s.filterBar} ${filtersOpen ? s.filterBarOpen : ''}`}>
          <div className={s.filterBarHeader}>
            <button
              className={s.filterClearBtn}
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              tabIndex={activeFiltersCount === 0 ? -1 : 0}
            >
              Wyczyść filtry
            </button>
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
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectFilters.length > 0 && booleanFilters.length > 0 && <div className={s.filterDivider} />}

          {booleanFilters.length > 0 && (
            <div className={s.toggleGroup}>
              <span className={s.filterLabel}>Cechy</span>
              <div className={s.toggles}>
                {booleanFilters.map(f => (
                  <label key={f.field} className={s.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={!!selected[f.field]}
                      onChange={() => toggleBoolean(f.field)}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {(selectFilters.length > 0 || booleanFilters.length > 0) && <div className={s.filterDivider} />}

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

      <main className={s.catalog}>
        <div className={s.sortBar}>
          <span className={s.sortMeta}>{visible.length} z {products.length} produktów</span>
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
              <ProductCard key={product.id} product={product} onAddToCart={openModal} onZoom={(src, alt) => setLightbox({ src, alt })}/>
            ))
          )}
        </div>
      </main>

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
            <a href="mailto:kontakt@novaevents.pl" className={s.footerMail}>kontakt@novaevents.pl</a>
            <p className={s.footerHours}>Pn–Pt, 8:00–17:00</p>
          </div>
          <div className={s.footerContact}>
            <p className={s.footerContactLabel}>Nawigacja</p>
            <nav>
              <ul className={s.footerNav}>
                {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </nav>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© {new Date().getFullYear()} Nova Events · Sprzedaż hurtowa i detaliczna</span>
        </div>
      </footer>

      <CartDrawer />
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