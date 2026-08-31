import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import s from '../page.module.css';
import st from '../static.module.css';

export const metadata = {
  title: 'Kontakt — Nova Events',
  description: 'Skontaktuj się z Nova Events w sprawie zamówień detalicznych i hurtowych wyposażenia cateringowego.',
};

export default function KontaktPage() {
  return (
    <div className={s.wrapper}>
      <SiteHeader />

      <div className={s.heroStrip}>
        <h1 className={s.heroTitle}>
          Kontakt
        </h1>
      </div>

      <div className={st.content}>
        <p className={st.lead}>
          Masz pytanie o dostępność, wycenę hurtową albo szczegóły produktu? Napisz lub zadzwoń —
          odpowiadamy w dni robocze.
        </p>

        <div className={st.contactGrid}>
          <div className={st.contactCard}>
            <p className={st.contactLabel}>Telefon</p>
            <a href="tel:+48123456789" className={st.contactValue}>+48 123 456 789</a>
            <p className={st.contactNote}>Pn–Pt, 8:00–17:00</p>
          </div>
          <div className={st.contactCard}>
            <p className={st.contactLabel}>E-mail</p>
            <a href="mailto:kontakt@novaevents.pl" className={st.contactValue}>kontakt@novaevents.pl</a>
            <p className={st.contactNote}>Odpowiedź zwykle w ciągu 1–2 dni roboczych</p>
          </div>
        </div>

        <div className={st.section} style={{ marginTop: 40 }}>
          <h2 className={st.sectionTitle}>Zamówienia hurtowe</h2>
          <p>
            W sprawie większych zamówień i cen hurtowych zajrzyj też na stronę{' '}
            <Link href="/zamowienia-hurtowe">Zamówienia hurtowe</Link> lub napisz bezpośrednio na adres powyżej.
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
