'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AddToCartModal } from '@/components/Cart';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import VariantGrid from './VariantGrid';
import s from './product.module.css';

const LABELS = {
  linia:        'Linia',
  typ:          'Typ',
  wymiary:      'Wymiary',
  opis:         'Opis',
  sztaplowanie: 'Sztaplowanie',
  skladanie:    'Składane',
  zestaw:       'Zestaw',
};

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

export default function ProductPageClient({ product }) {
  const [modal, setModal] = useState(null);

  const openModal = (wariantIndex) => setModal({ product, wariantIndex });
  const closeModal = () => setModal(null);

  return (
    <div className={s.wrapper}>
      <SiteHeader />

      <main className={s.main}>

        <Link href="/" className={s.backLink}>← Wróć do katalogu</Link>

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

      <SiteFooter />

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
