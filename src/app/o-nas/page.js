import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Link from 'next/link';
import s from '../page.module.css';
import st from '../static.module.css';

export const metadata = {
  title: 'O nas — Nova Events',
  description: 'Nova Events — wyposażenie cateringowe na wynajem i sprzedaż hurtową dla eventów, wesel, konferencji i gastronomii.',
};

export default function ONasPage() {
  return (
    <div className={s.wrapper}>
      <SiteHeader />

      <div className={s.heroStrip}>
        <h1 className={s.heroTitle}>
          O <em>nas</em>
        </h1>
      </div>

      <div className={st.content}>
        <p className={st.lead}>
          Nova Events dostarcza wyposażenie cateringowe — stoły, krzesła, ławki i zestawy —
          w sprzedaży hurtowej i detalicznej, dla organizatorów eventów, wesel, konferencji
          oraz firm gastronomicznych.
        </p>

        <div className={st.section}>
          <h2 className={st.sectionTitle}>Co oferujemy</h2>
          <div className={st.cardGrid}>
            <div className={st.card}>
              <p className={st.cardTitle}>Sprzedaż detaliczna</p>
              <p className={st.cardText}>Pojedyncze sztuki wyposażenia dostępne od ręki, z możliwością wyboru koloru i wariantu w katalogu.</p>
            </div>
            <div className={st.card}>
              <p className={st.cardTitle}>Zamówienia hurtowe</p>
              <p className={st.cardText}>Ceny hurtowe widoczne wprost przy każdym produkcie — dla firm wyposażających salę na stałe lub potrzebujących większych ilości.</p>
            </div>
            <div className={st.card}>
              <p className={st.cardTitle}>Zestawy cateringowe</p>
              <p className={st.cardText}>Gotowe komplety stół + krzesła lub stół + ławki, dobrane pod kątem szybkiej organizacji eventu.</p>
            </div>
          </div>
        </div>

        <div className={st.section}>
          <h2 className={st.sectionTitle}>Dla kogo pracujemy</h2>
          <p>
            Obsługujemy organizatorów wesel i eventów okolicznościowych, firmy cateringowe,
            sale bankietowe oraz konferencyjne — wszędzie tam, gdzie liczy się solidne,
            estetyczne wyposażenie i elastyczność w doborze ilości.
          </p>
        </div>

        <div className={st.ctaRow}>
          <Link href="/" className={s.btnPrimary}>Zobacz katalog</Link>
          <Link href="/kontakt" className={s.btnGhost}>Skontaktuj się</Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
