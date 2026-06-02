'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { AddToCartModal, CartDrawer, CartIcon } from '@/components/Cart';
import { useTheme } from '@/lib/themeStore';
import { ProductSkeletonPage } from '@/components/Skeleton';
import VariantGrid from './VariantGrid';
import s from './product.module.css';
import { getProducts } from '@/lib/getProducts';

const LABELS = {
  linia:        'Linia',
  typ:          'Typ',
  wymiary:      'Wymiary',
  opis:         'Opis',
  sztaplowanie: 'Sztaplowanie',
  skladanie:    'Składane',
  zestaw:       'Zestaw',
};

function dostepnoscDot(d = '') {
  const lower = d.toLowerCase();
  if (lower.includes('magazyn') || lower.includes('dostępn')) return s.dotDostepne;
  if (lower.includes('ostatni')) return s.dotOstatnie;
  return s.dotWkrotce;
}

function BoolValue({ value }) {
  if (value) return <span className={s.boolYes}>✓ Tak</span>;
  return <span className={s.boolNo}>Nie</span>;
}

function FieldValue({ value }) {
  if (typeof value === 'boolean') return <BoolValue value={value} />;
  if (value === 0) return <span>0</span>;
  if (!value) return <span className={s.tdEmpty}>—</span>;
  return <span>{value}</span>;
}

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { theme, initTheme, toggleTheme } = useTheme();
  const [product, setProduct] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await getProducts();
        const found = products.find(p => p.id === decodeURIComponent(id));
        setProduct(found || null);
      } catch (error) {
        console.error('Failed to load product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const openModal = (wariantIndex) => setModal({ product, wariantIndex });
  const closeModal = () => setModal(null);

  if (loading) {
    return <ProductSkeletonPage />;
  }

  if (!product) {
    return (
      <div style={{ padding: 64, textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--text-dim)' }}>
        Nie znaleziono produktu
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <a href="/" className={s.headerLogo}>Nova Events</a>
          <div className={s.headerRight}>
            <CartIcon />
            <button className={s.themeToggle} onClick={toggleTheme} aria-label="Zmień motyw" />
          </div>
        </div>
      </header>

      <main className={s.main}>

        <a href="/" className={s.backLink}>← Wróć do katalogu</a>

        {/* HERO */}
        <div className={s.hero}>
          <p className={s.heroCategory}>
            {product.linia ? `${product.linia} · ${product.typ}` : product.typ}
          </p>
          <h1 className={s.heroTitle}>{product.name}</h1>
          {product.wymiary && <p className={s.heroSub}>{product.wymiary}</p>}
          <div className={s.goldLine} />
        </div>

        {/* WARIANTY */}
        <section className={s.variantsSection}>
  <h2 className={s.sectionTitle}>
    Warianty<span className={s.sectionCount}>({product.warianty.length})</span>
  </h2>
  <VariantGrid warianty={product.warianty} productName={product.name} onAddToCart={openModal} />
</section>

        {/* SZCZEGÓŁY */}
        <section className={s.detailsSection}>
          <h2 className={s.sectionTitle}>Szczegóły</h2>

          <table className={s.detailsTable}>
            <tbody>
              {Object.entries(LABELS).map(([key, label]) => (
                <tr key={key}>
                  <td className={s.tdLabel}>{label}</td>
                  <td className={s.tdValue}>
                    <FieldValue value={product[key]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>

      <CartDrawer />
      {modal && (
        <AddToCartModal
          product={modal.product}
          wariantIndex={modal.wariantIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}