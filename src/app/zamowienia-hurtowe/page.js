import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import s from '../page.module.css';
import st from '../static.module.css';

export const metadata = {
  title: 'Zamówienia hurtowe — Nova Events',
  description: 'Sprzedaż hurtowa wyposażenia cateringowego — stoły, krzesła, ławki i zestawy w cenach hurtowych.',
};

export default function ZamowieniaHurtowePage() {
  return (
    <div className={s.wrapper}>
      <SiteHeader />

      <div className={s.heroStrip}>
        <h1 className={s.heroTitle}>
          Zamówienia <em>hurtowe</em>
        </h1>
      </div>

      <div className={st.content}>
        <p className={st.lead}>
          Każdy produkt w katalogu ma widoczną cenę hurtową obok detalicznej — obowiązuje ona
          przy zamówieniach większej ilości sztuk tego samego produktu.
        </p>

        <div className={st.section}>
          <h2 className={st.sectionTitle}>Jak to działa</h2>
          <div className={st.cardGrid}>
            <div className={st.card}>
              <p className={st.cardTitle}>1. Wybierz produkty</p>
              <p className={st.cardText}>Przejrzyj katalog i sprawdź ceny hurtowe przy interesujących Cię pozycjach.</p>
            </div>
            <div className={st.card}>
              <p className={st.cardTitle}>2. Skontaktuj się z nami</p>
              <p className={st.cardText}>Napisz lub zadzwoń z listą produktów i ilościami — ustalimy szczegóły i dostępność.</p>
            </div>
            <div className={st.card}>
              <p className={st.cardTitle}>3. Ustalamy warunki</p>
              <p className={st.cardText}>Potwierdzamy ceny, termin realizacji i sposób odbioru lub dostawy.</p>
            </div>
          </div>
          <p className={st.note}>
            Dokładne warunki (minimalna ilość, terminy, dostawa) ustalane są indywidualnie —
            napisz do nas, a odpowiemy najszybciej jak to możliwe.
          </p>
        </div>

        <div className={st.ctaRow}>
          <Link href="/" className={s.btnPrimary}>Przeglądaj katalog</Link>
          <Link href="/kontakt" className={s.btnGhost}>Zapytaj o wycenę</Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
