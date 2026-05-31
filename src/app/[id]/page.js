import { getProducts } from '@/lib/getProducts';
import Image from 'next/image';
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

export default async function ProductPage({ params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find(p => p.id === decodeURIComponent(id));

  if (!product) {
    return (
      <div style={{ padding: 64, textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--text-dim)' }}>
        Nie znaleziono produktu
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
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
  <VariantGrid warianty={product.warianty} productName={product.name} />
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
    </div>
  );
}